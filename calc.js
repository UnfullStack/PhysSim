let container = document.getElementById('graph');
let graph = Desmos.GraphingCalculator(container);

// set settings for graph
graph.updateSettings({degreeMode: true});

// list of needed variables
// first item is the name, second is the default value, third and fourth are min and max
const VARS = [
    ["v_o",,0,25], // initial velocity
    ["\\Theta",,-180,180], // angle (theta) (capital is used because desmos treats lowercase theta as special)
    ["t",,0,20], // time
    ["y_o"], // initial y-position
    ["g",-9.8] // acceleration due to gravity
];

// variable defaults
const DEFS = [
    "a", // name (hopefully doesn't need to be used)
    0, // value
    -10, // lower bound
    10, // upper bound
]

// add notes to the graph
graph.setExpression({
    id:"note_t",
    type: "text",
    text: "Move or change the t slider/variable to see position across time!"
});
graph.setExpression({
    id:"note_vars",
    type: "text",
    text: "You can also manipulate the other values if you don't want to use the transfer button, or want to change them individually. (Note that the graph does not have components, just a single unified velocity.)"
});
graph.setExpression({
    id:"note_tiny",
    type: "text",
    text: "If the y position at t is an extremly small scientific number, just assume it's 0."
});

// add all variables to the graph
for (let i = 0; i < VARS.length; i++) {
    let item = VARS[i];
    // set default values if nothing is given
    // go through defaults
    for (let v = 0; v < DEFS.length; v++) {
        let def = DEFS[v];
        if (!(v in item)) {
            item[v] = def;
        }
    }
    
    graph.setExpression({
        id:`var_${item[0]}`,
        latex:`${item[0]}=${item[1]}`,
        sliderBounds: {
            min: item[2],
            max: item[3],
        }
    });
}

// add x and y position expressions
graph.setExpression({id:"ex_pos_x",latex:"x_1(t)=v_o \\cos(\\Theta) t",hidden:true});
graph.setExpression({id:"ex_pos_y",latex:"y_1(t)=y_o+v_o \\sin(\\Theta) t + \\frac{1}{2} g t^2",hidden:true});
// add plot for showing the movement of the object
graph.setExpression({id:"ls_t",latex:"t_l=[0,0.05 \\ldots 10]"})
graph.setExpression({
    id:"plt_pos",
    latex:"(x_1(t_l),y_1(t_l))",
    lines: true
});

// add a point that shows where the object is at t (time)
// need desmos variables for the x and y to make the label update
graph.setExpression({
    id: "var_ct_x",
    latex:"c_x=x_1(t)"
});
graph.setExpression({
    id: "var_ct_y",
    latex:"c_y=y_1(t)"
});
graph.setExpression({
    id: "plt_ct",
    latex:"(c_x,c_y)",
    showLabel: true,
    label: "t: ${t}s | X: ${c_x} | Y: ${c_y}"
});

// add the arrow and the variables used to define it
graph.setExpression({
    id: "var_va_x",
    latex: "t_x=\\cos(\\Theta) v_o"
});
graph.setExpression({
    id: "var_va_y",
    latex: "t_y=\\sin(\\Theta) v_o + y_o"
});
graph.setExpression({
    id: "plt_va",
    latex: "(0,y_o),(t_x,t_y),(t_x-\\cos(\\Theta+45),t_y-\\sin(\\Theta+45)),(t_x,t_y),(t_x-\\cos(\\Theta-45),t_y-\\sin(\\Theta-45))",
    points: false,
    lines: true
});

// add a blank slot for users to type in
// added because there is sometimes a bug that prevents new ones from being added
graph.setExpression({id: "blank", latex: ""})

// transfer variables button
function transferVars() {
    for (let i = 0; i < VARS.length; i++) {
        item = VARS[i];
        // convert to lowercase because the form uses \theta and the graph uses \Theta
        if (document.getElementById("vars")[item[0].toLowerCase()]) {
            let elem = document.getElementById("vars")[item[0].toLowerCase()];
            if (elem.value != "") {
                graph.setExpression({
                    id: `var_${item[0]}`,
                    latex: `${item[0]} = ${elem.value}`
                });
            }
        }
    }
}

// functions for converting between degrees and radians
function toDegrees(rad) {
    return rad * (180 / Math.PI);
}
function toRadians(deg) {
    return deg * (Math.PI / 180);
}

// function for checking if a variable has an entered value or not
function checkVar(name) {
    let check = false;

    if (document.getElementById("vars")[name]) {
        if (document.getElementById("vars")[name].value) {
            check = true;
        }
    }

    return check;
}

// function for finding a specific variable
function getVar(name) {
    let form = document.getElementById("vars");
    let fallback = null; // fallback variable if no solution is found
    let final = null; // final value

    // anytime we prepare to return something, we'll parse it to a float so it includes decimals

    if (form[name]) {
        let box = form[name];
        // set fallback
        if (box.value) {
            fallback = parseFloat(box.value);
        }
        // check that the box is not checked. if it is checked, we should pretend the entry is blank so that we solve for it
        if (box.value && !document.getElementById("c-"+name).checked) {
            final = box.value;
        } else {
            // here, we need to check for each variable and get an equation that will tell us what it is
            if (name == "v_o") {
                // v_o = root(v_x^2+v_oy^2)
                final = Math.sqrt(getVar("v_x")**2+getVar("v_oy")**2);
            }
            if (name == "\\theta") {
                // theta = tan^-1(v_oy/v_x)
                final = toDegrees(Math.atan(getVar("v_oy")/getVar("v_x")));
            }
            if (name == "v_x") {
                // base formula on what we have
                if (checkVar("\\theta") && checkVar("v_o")) {
                    // v_x = cos(theta)*v_o
                    final = Math.cos(toRadians(getVar("\\theta")))*getVar("v_o");
                } else if (checkVar("v_o") && checkVar("v_oy")) {
                    // v_x = root(v_o^2-v_oy^2)
                    final = Math.sqrt(getVar("v_o")**2-getVar("v_oy")**2);
                }
            }
            if (name == "v_oy") {
                // check what is availabe to determine the formula we will use

                if (checkVar("\\theta") && checkVar("v_o")) {
                    // v_oy = sin(theta)*v_o
                    final = Math.cos(toRadians(getVar("\\theta")))*getVar("v_o");
                } else if (checkVar("v_o") && checkVar("v_x")) {
                    // v_oy = root(v_o^2-v_x^2)
                    final = Math.sqrt(getVar("v_o")**2-getVar("v_x")**2);
                }
            }
            if (name == "x") {
                // x (final horizontal position) = v_x*t
                final = getVar("v_x")*getVar("t");
            }
            if (name == "t") {
                // i don't feel like writing out this equation because it's frankly absurd
                // here i felt the need to define variables because of reuse and complication
                let v_oy = getVar("v_oy");
                let g = getVar("g")*-1; // gravity is inverted because otherwise the calculations are incorrect. i'm not entirely sure, i've just verified that inverting makes it work
                let y_o = getVar("y_o");
                final = (v_oy+Math.sqrt(v_oy**2+2*g*y_o))/g;
            }
            if (name == "v_fy") {
                // v_fy = v_oy + g * t
                final = getVar("v_oy")+getVar("g")*getVar("t");
            }
            if (name == "y_max") {
                // y_max = y_o + (v_oy^2)/2g
                final = getVar("y_o")+((getVar("v_oy")**2)/(2*-getVar("g")));
            }
        }
    }

    if (!final) {
        return fallback;
    } else {
        return parseFloat(final);
    }
}

// function that will go through all the variables and calculate them using getVar
function solveVars() {
    const SOLVES = [
        "v_o",
        "v_x",
        "v_oy",
        "\\theta",
        "x",
        "g",
        "t",
        "v_fy",
        "y_max",
        "y_o"
    ];
    let form = document.getElementById("vars");
    // go through a list of everything that needs to be solved for
    for (let i = 0; i < SOLVES.length; i++) {
        form[SOLVES[i]].value = getVar(SOLVES[i]);
    }
}

// function that will clear the variables IF the user is sure
const CLEAR_TEXT_1 = "Clear Variables";
const CLEAR_TEXT_2 = "Confirm";
const DEF_VARS = {
    g: -9.8,
    y_o: "0", // gets converted to a number. if it starts as a number, it gets ignored
}
function clearVars() {
    let btn = document.getElementById("btnClear");
    let btn2 = document.getElementById("btnCancelClear");
    if (btn.textContent == CLEAR_TEXT_1) {
        btn.textContent = CLEAR_TEXT_2;
        btn2.hidden = false;
    } else {
        // go through the inputs in the form
        let inputs = document.getElementById("vars").getElementsByTagName("input");
        for (let i = 0; i < inputs.length; i++) {
            // only if we don't have a default value for it
            if (!DEF_VARS[inputs[i].name]) {
                inputs[i].value = null;
            } else {
                inputs[i].value = DEF_VARS[inputs[i].name];
            }
        }
        btn.textContent = CLEAR_TEXT_1;
        btn2.hidden = true;
    }
}
// set the button's first text
document.getElementById("btnClear").textContent = CLEAR_TEXT_1;
// cancel function
function cancelClearVars() {
    let btn = document.getElementById("btnClear");
    let btn2 = document.getElementById("btnCancelClear");
    btn.textContent = CLEAR_TEXT_1;
    btn2.hidden = true;
}