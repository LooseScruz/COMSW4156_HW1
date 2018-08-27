/**
 * Created by mglynn on 11/12/2016.
 */
var animation_interval;
var animating_object;

function turn_around_360 (obj) {
    is_animating = true;
    animating_object = obj;
    setTimeout(end_animation, 5000);
    animation_interval = setInterval(update_turn_around_animation, 100);
}

function update_turn_around_animation () {
    mvp_V.rotate(7.2, 0, 1, 0);
    draw();
}

function end_animation () {
    clearInterval(animation_interval);
    is_animating = false;
}