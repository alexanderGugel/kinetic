window.onload = function () {
    'use strict';

    var view, indicator, relative,
        min, max, offset, reference, pressed, xform,
        velocity, frame, timestamp, ticker,
        amplitude, target, timeConstant;

    var now = window.performance ? function() {
        return window.performance.now();
    } : Date.now;

    function ypos(e) {
        // touch event
        if (e.targetTouches && (e.targetTouches.length >= 1)) {
            return e.targetTouches[0].clientY;
        }

        // mouse event
        return e.clientY;
    }

    function scroll(y) {
        offset = (y > max) ? max : (y < min) ? min : y;
        view.style[xform] = 'translateY(' + (-offset) + 'px)';
        indicator.style[xform] = 'translateY(' + (offset * relative) + 'px)';
    }

    function track() {

        var t, elapsed, delta, v;

        t = now();
        elapsed = t - timestamp;
        timestamp = t;
        delta = offset - frame;
        frame = offset;

        v = 1000 * delta / (1 + elapsed);
        velocity = 0.8 * v + 0.2 * velocity;
        // velocity = 0.5 * (v + velocity);

        ticker = requestAnimationFrame(track)
    }

    function autoScroll() {
        var elapsed, delta;

        if (amplitude) {
            elapsed = now() - timestamp;
            delta = -amplitude * Math.exp(-elapsed / timeConstant);
            if (delta > 0.5 || delta < -0.5) {
                scroll(target + delta);
                requestAnimationFrame(autoScroll);
            } else {
                scroll(target);
            }
        }
    }

    function tap(e) {
        pressed = true;
        reference = ypos(e);

        velocity = amplitude = 0;
        frame = offset;
        timestamp = now();
        cancelAnimationFrame(ticker);
        ticker = requestAnimationFrame(track);

        e.preventDefault();
        e.stopPropagation();
        return false;
    }

    function drag(e) {
        var y, delta;
        if (pressed) {
            y = ypos(e);
            delta = reference - y;
            if (delta > 2 || delta < -2) {
                reference = y;
                scroll(offset + delta);
            }
        }
        e.preventDefault();
        e.stopPropagation();
        return false;
    }

    function release(e) {
        pressed = false;

        cancelAnimationFrame(ticker);
        if (velocity > 10 || velocity < -10) {
            amplitude = 0.8 * velocity;
            target = Math.round(offset + amplitude);
            timestamp = now();
            requestAnimationFrame(autoScroll);
        }

        e.preventDefault();
        e.stopPropagation();
        return false;
    }

    view = document.getElementById('view');
    if (typeof window.ontouchstart !== 'undefined') {
        view.addEventListener('touchstart', tap);
        view.addEventListener('touchmove', drag);
        view.addEventListener('touchend', release);
    }
    view.addEventListener('mousedown', tap);
    view.addEventListener('mousemove', drag);
    view.addEventListener('mouseup', release);

    max = parseInt(getComputedStyle(view).height, 10) - innerHeight;
    offset = min = 0;
    pressed = false;
    timeConstant = 325; // ms

    indicator = document.getElementById('indicator');
    relative = (innerHeight - 30) / max;

    xform = 'transform';
    ['webkit', 'Moz', 'O', 'ms'].every(function (prefix) {
        var e = prefix + 'Transform';
        if (typeof view.style[e] !== 'undefined') {
            xform = e;
            return false;
        }
        return true;
    });
};
