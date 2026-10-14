// Dispatch every time when websocket is connected (or reconnected)
window.addEventListener("unichat:connected", ({ detail }) => {
    // This listener doesn't receive any data, actually it just notifies
    // that connection is established or re-established.
});

window.addEventListener("unichat:event", ({ detail: event }) => {
    console.log(event);
});
