document.onclick = (event) => {
  event.preventDefault();
};

const operators = [
  "~",
  "!",
  "cos",
  "sin",
  "tan",
  "acos",
  "asin",
  "atan",
  "log",
  "ln",
  "√",
  "P",
  "C",
  "^",
  "×",
  "÷",
  "%",
  "+",
  "-",
];
const unary_operators = [
  "~",
  "!",
  "cos",
  "sin",
  "tan",
  "acos",
  "asin",
  "atan",
  "log",
  "ln",
  "√",
];
const constants = ["π", "e"];

let input = document.querySelector(".input");
let previous = document.querySelector(".previous");
let inputElements = [];
let previousInputElements = [];

document.onkeydown = (event) => {
  console.log(event);

  let keyMap = {
    e: "e",
    c: "cos",
    s: "sin",
    t: "tan",
    C: "C",
    p: "π",
    l: "ln",
    L: "log",
    "*": "×",
    "/": "÷",
    "(": "(",
    ")": ")",
  };

  let key = event.key;

  if (/\d|\./.test(key) || operators.includes(key)) {
    button(key);
  } else if (keyMap[key]) {
    button(keyMap[key]);
  } else if (key == "=" || key == "Enter") {
    equals();
  } else if (key == "Backspace") {
    backspace();
    updateOutput();
  }
};

previous.onclick = (_) => {
  if (previousInputElements.length != 0) {
    inputElements = [...previousInputElements];
    previousInputElements = [];
    updateOutput();
  }
};

/**
* Performs an operation based on pressed button
* @param {String} button_type
*/
function button(button_type) {
  console.log(button_type);

  switch (button_type) {
    case "=":
      equals();
      break;
    case "backspace":
      backspace();
      updateOutput();
      break;
    default:
      if (typeof inputElements[inputElements.length - 1] == "number") {
        if (!["!", "×", "÷", "-", "+", "%", "^"].includes(button_type)) {
          inputElements = [];
        }
      }
      inputElements.push(button_type);
      updateOutput();
      break;
  }
}

/**
* Evaluates input and displays answer
*/
function equals() {
  let answer;
  try {
    answer = evaluatePostfix(infixToPostfix());
    if (Number.isNaN(answer)) {
      answer = "Error";
    }
  } catch (e) {
    answer = "Error";
  }
  previousInputElements = [...inputElements];
  inputElements = [answer];
  updateOutput();
  if (inputElements == "Error") {
    inputElements = [];
  }
}

/**
* Deletes last element in the mathematical expression
*/
function backspace() {
  if (inputElements.length > 0) {
    inputElements.pop();
  }
}

/**
* @param {Array<String>} arrayElements Array of elements to be converted to string
* @returns {String} a string representation of the `inputElements` expression
*/
function stringifyArray(arrayElements) {
  if (arrayElements.length == 0) {
    return "";
  } else {
    return arrayElements.reduce(
      (prev = "", curr) => prev + curr.toString()
    );
  }
}

/**
* Updates the output pane of the program
*/
function updateOutput() {
  previous.innerText = stringifyArray(previousInputElements);
  input.innerText = stringifyArray(inputElements);
}

/**
* Converts the input from the user, which is supposed to be in
* infix notation, into postfix notation for easier evaluation
* @returns {Array<String, Number>} Postfix expression
*/
function infixToPostfix() {
  let expression = [...inputElements];

  let stack = [];
  let result = [];

  for (let i = 0; i < expression.length; i++) {
    // Parsing numbers, which include digit characters and optionally decimal points
    if (/\d|\./.test(expression[i])) {
      let num = expression[i];

      // This takes care of implicit multiplication between the number and
      // a parentheses or constant. In such cases, the × sign is inserted
      if (
        i != 0 &&
        (expression[i - 1] == ")" || constants.includes(expression[i]))
      ) {
        stack.push("×");
      }

      // Since the inputElements array stores digits of numbers as individual characters
      // in a string, they all have to be concatenated together into one string
      while (
        i != expression.length - 1 &&
        /\d|\./.test(expression[i + 1])
      ) {
        i += 1;
        num += expression[i];
      }
      // The string of numbers is then converted into a single float
      let asNumber = Number(num);
      if (Number.isNaN(asNumber)) {
        throw new TypeError("Invalid number: " + num);
      }
      result.push(asNumber);
    }
    // Parsing operators
    else if (operators.includes(expression[i])) {
      // This helps to take care of cases where the - sign is used to negate a number rather than subtracting.
      // In such cases the - sign is converted into a ~ sign which the evaluator interprets as a negation operator
      if (expression[i] == "-") {
        if (
          i == 0 ||
          operators.includes(expression[i - 1]) ||
          expression[i - 1] == "("
        ) {
          expression[i] = "~";
        }
      }

      // This helps to take care of cases where there's an implicit multiplication between a number or parentheses
      // and a function, such as "3cos(27)" or "(4 - 2)ln(50)". In both cases we have to insert the × operator in between
      if (
        unary_operators.includes(expression[i]) &&
        expression[i] != "~" &&
        expression[i] != "!" &&
        i != 0 &&
        (/\d|\./.test(expression[i - 1]) ||
          expression[i - 1] == ")" ||
          constants.includes(expression[i]))
      ) {
        stack.push("×");
      }

      while (
        stack.length > 0 &&
        !(stack[stack.length - 1] == "(") &&
        hasHigherPrecedence(stack[stack.length - 1], expression[i])
      ) {
        result.push(stack.pop());
      }

      // If the operator is a factorial operator ("!"), immediately insert it at the end of
      // the postfix expression after its operand since "!" is already a postfix notation
      if (expression[i] == "!") result.push(expression[i]);
      else stack.push(expression[i]);
    } else if (constants.includes(expression[i])) {
      // More implicit multiplication
      if (
        i != 0 &&
        (/\d|\./.test(expression[i - 1]) ||
          expression[i - 1] == ")" ||
          constants.includes(expression[i - 1]))
      ) {
        stack.push("×");
      }

      if (expression[i] == "π") {
        result.push(Math.PI);
      } else if (expression[i] == "e") {
        result.push(Math.E);
      }
    } else if (expression[i] == "(") {
      // Implicit multiplication cases
      if (
        i != 0 &&
        (/\d|\./.test(expression[i - 1]) ||
          expression[i - 1] == ")" ||
          constants.includes(expression[i]))
      ) {
        stack.push("×");
      }

      stack.push("(");
    } else if (expression[i] == ")") {
      while (stack.length > 0 && !(stack[stack.length - 1] == "(")) {
        result.push(stack.pop());
      }

      stack.pop();
    }
  }

  while (stack.length > 0) {
    result.push(stack.pop());
  }

  return result;
}
/**
* Returns true if the first argument has a higher precedence
* than the second argument
* @param {String} first First operand
* @param {String} second Second operand
* @returns {Boolean} `true` or `false`
*/
function hasHigherPrecedence(first, second) {
  return operators.indexOf(first) < operators.indexOf(second);
}

/**
* Evaluates the postfix expression as produced by the
* `infixToPostfix` function
* @param {Array<String, Number>} expression Postfix expression
* @returns {Number} Resulting value or answer
*/
function evaluatePostfix(expression) {
  // this console.log could be removed. Just placed it here
  // so I could see the values everytime I ran the program
  console.log(expression);

  let stack = [];

  for (let element of expression) {
    if (typeof element == "number") {
      stack.push(element);
    } else if (operators.includes(element)) {
      answer = 0;

      console.log(stack.toString()); // Could also be removed or just commented out

      if (unary_operators.includes(element)) {
        answer = operation(element, stack.pop());
      } else {
        answer = operation(element, stack.pop(), stack.pop());
      }

      stack.push(answer);
    }
  }

  return stack.pop();
}

/**
* Used by the `evaluatePostfix` function to perform individual operations
* @param {String} operator
* @param {Number} operand2
* @param {Number} operand1
* @returns {Number} Result of the operation
*/
function operation(operator, operand2, operand1 = 0) {
  if (operator == "+") {
    return operand1 + operand2;
  } else if (operator == "%") {
    return operand1 % operand2;
  } else if (operator == "-") {
    return operand1 - operand2;
  } else if (operator == "×") {
    return operand1 * operand2;
  } else if (operator == "÷") {
    return operand1 / operand2;
  } else if (operator == "^") {
    return Math.pow(operand1, operand2);
  } else if (operator == "!") {
    return factorial(operand2);
  } else if (operator == "sin") {
    return Math.sin(operand2);
  } else if (operator == "cos") {
    return Math.cos(operand2);
  } else if (operator == "tan") {
    return Math.tan(operand2);
  } else if (operator == "asin") {
    return Math.asin(operand2);
  } else if (operator == "acos") {
    return Math.acos(operand2);
  } else if (operator == "atan") {
    return Math.atan(operand2);
  } else if (operator == "~") {
    return -1 * operand2;
  } else if (operator == "ln") {
    return Math.log(operand2);
  } else if (operator == "log") {
    return Math.log10(operand2);
  } else if (operator == "√") {
    return Math.sqrt(operand2);
  } else if (operator == "P") {
    return factorial(operand1) / factorial(operand1 - operand2);
  } else if (operator == "C") {
    return (
      factorial(operand1) /
      (factorial(operand1 - operand2) * factorial(operand2))
    );
  }
}

/**
* Returns factorial of `n`
* @param {Number} n Input number
* @returns {Number} Factorial of `n`
*/
function factorial(n) {
  if (n < 0)
    throw new TypeError("Cannot find factorial of negative number: " + n);
  else if (!Number.isInteger(n))
    throw new TypeError("Cannot find factorial of decimal number: " + n);
  else if (n < 2) return 1;
  else return n * factorial(n - 1);
}