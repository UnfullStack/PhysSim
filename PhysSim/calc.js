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
graph.setExpression({id:"ex_pos_x",latex:"x_1(t)=v_o \\cos(\\Theta) t",hidden:true})
graph.setExpression({id:"ex_pos_y",latex:"y_1(t)=y_o+v_o \\sin(\\Theta) t + \\frac{1}{2} g t^2",hidden:true})
// add plot for showing the movement of the object
graph.setExpression({id:"ls_t",latex:"t_l=[0,0.05 \\ldots 10]"})
graph.setExpression({
    id:"plt_pos",
    latex:"(x_1(t_l),y_1(t_l))",
    lines: true
})

// add a point that shows where the object is at t (time)
// need desmos variables for the x and y to make the label update
graph.setExpression({
    id: "var_ct_x",
    latex:"c_x=x_1(t)"
})
graph.setExpression({
    id: "var_ct_y",
    latex:"c_y=y_1(t)"
})
graph.setExpression({
    id: "plt_ct",
    latex:"(c_x,c_y)",
    showLabel: true,
    label: "t: ${t}s | X: ${c_x} | Y: ${c_y}"
})

// add a blank slot for users to type in
// added because there is sometimes a bug that prevents new ones from being added
graph.setExpression({id: "blank", latex: ""})

// transfer variables button
function transferVars() {
    for (let i = 0; i < VARS.length; i++) {
        item = VARS[i];
        if (document.getElementById("vars")[item[0]]) {
            let elem = document.getElementById("vars")[item[0]];
            if (elem.value != "") {
                graph.setExpression({
                    id: `var_${item[0]}`,
                    latex: `${item[0]} = ${elem.value}`
                });
            }
        }
    }
}