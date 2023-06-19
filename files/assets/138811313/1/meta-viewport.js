// Override PlayCanvas' default meta tag with the additional new viewport-fit attribute for iPhone X
var meta = document.querySelector('meta[name=viewport]');
meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no, viewport-fit=cover');
