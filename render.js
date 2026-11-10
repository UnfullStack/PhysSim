// this file is meant to render with katex where it is needed
// katex renders math

// render math on all elements with the math class
let elements = document.getElementsByClassName("math");

for (let i = 0; i < elements.length; i++) {
    let element = elements[i];
    katex.render(element.textContent,element);
}