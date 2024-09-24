const indicator = document.getElementById('indicator');
const dropzone = document.getElementById('dropzone');
const lineHeight = 20;
let isDragging = false;
let lineNumber;
let currentLanguage = "cpp";
let isMessageHandlingEnabled = false;
let data;


    const operatorOptions = {
    cpp: ['==', '!=', '<', '>', '<=', '>=', '&&', '||'],
    java: ['==', '!=', '<', '>', '<=', '>=', '&&', '||'],
    python: ['==', '!=', '<', '>', '<=', '>=', 'and', 'or'],
    javascript: ['===', '!==', '<', '>', '<=', '>=', '&&', '||'],
    php: ['==', '!=', '<', '>', '<=', '>=', '&&', '||']
}

document.getElementById('drawerToggle').addEventListener('click', function() {
    const drawer = document.querySelector('.drawer');
    const isClosed = drawer.classList.toggle('closed');
    if (isClosed) {
        drawer.style.transform = 'translateX(-200px)';
    } else {
        drawer.style.transform = 'translateX(0)'; // Move drawer back into view
    }
});


        let isRunInitiated = false; // Flag to track run button click

document.getElementById('runButton').addEventListener('click', function() {
    const iframe = document.getElementById('oc-editor');
    iframe.contentWindow.postMessage({
        eventType: 'triggerRun'
    }, "*");
    isRunInitiated = true; // Set flag to true when run is initiated
});



        let codeContent = ""; //codeContent to check
        let isOutputVisible = false;
        let previousError = '';
        let previousOutput = '';

        function getFileContent(files) {
            if (files && files.length > 0) {
                codeContent = files[0].content;
                console.log('File content:', codeContent);
            } else {
                console.log('No files available.');
            }
        }


        let actions;

        window.onmessage = function (e) {
            console.log('Received message:', e.data);
            if (e.data && e.data.language) {
                console.log('Detected language change:', e.data.language);
            }

            if (e.data.action === 'runComplete' && isRunInitiated) {
                const outputHeader = document.getElementById('outputHeader');
                const errorOutput = document.getElementById('errorOutput');
                const resultOutput = document.getElementById('resultOutput');
                
                if (e.data.result.success) {
                    previousError = ''; // Clear previous errors
                    previousOutput = e.data.result.output; // Store output

                     // Get file content // code
                    getFileContent(e.data.files);
        
                    // Show output and hide error
                    outputHeader.textContent = 'Output';
                    errorOutput.style.display = 'none';
                    resultOutput.style.display = 'block';
                    resultOutput.textContent = previousOutput; // Show output
                    // console.log (codeContent);
                    transformCode();
                    runcode(codeToBreakDown);
                    actions =  transformIndexArray(indexArray);

                    document.querySelector("#startCutsceneButton").click();

                } else {
                    // Reset the output when there's an error
                    previousOutput = ''; // Clear previous output
                    resultOutput.style.display = 'none'; // Hide output
        
                    previousError = e.data.result.output; // Store errors
                    outputHeader.textContent = 'Error Messages';
                    errorOutput.style.display = 'block';
                    errorOutput.textContent = previousError; // Show errors
                }
                isRunInitiated = false; 
            }
        };



        



    
        let indexArray = [];


        function transformCode(){
            code = codeContent; // Get user input

            // Regex patterns to find if statements and dynamic swap assignments
            const ifPattern = /if\s*\((.*?)\)\s*{/g; // Regex to find 'if' statements and capture the condition
            const swapPattern = /(\[arr\[(.*?)\],\s*arr\[(.*?)\]\]\s*=\s*\[arr\[(.*?)\],\s*arr\[(.*?)\]\];?|arr\[(.*?)\]\s*=\s*arr\[(.*?)\s*([+-]?\d+)?\];?)/g; // Combined regex for swapping assignments
        
            // Array to store the indices and signs
            
        
            function transformLog(input) {
                return input.replace(/console\.log\("([^"]*) \((arr\[(.*?)\]|([a-zA-Z_]\w*|\d+)) ([<>=!]{1,2}=?) (arr\[(.*?)\]|([a-zA-Z_]\w*|\d+))\)"/, 
                    (match, message, firstArr, firstIndex, firstValue, operator, secondArr, secondIndex, secondValue) => {
                        // Capture either the index or the value itself for index1 and index2
                        const index1 = firstArr ? firstIndex : firstValue; // If array, use index, otherwise use value
                        const index2 = secondArr ? secondIndex : secondValue; // If array, use index, otherwise use value
        
                        // Return the transformed console.log statement with index pushing logic as text
                        return `console.log("${message}", ${firstArr || firstValue}, "${operator}", ${secondArr || secondValue});\nindexArray.push({ index1: ${index1}, index2: ${index2 || secondValue}, sign: "${operator}" }`;
                    });
            }
        
            function transformSwapLog(input) {
                return input.replace(/console\.log\("Swapping: \[?arr\[(.*?)\]\]?(?:, arr\[(.*?)\])? = \[?arr\[(.*?)\]\]?(?:, arr\[(.*?)\])?;"/,
                    (match, first, second, third, fourth) => {
                        // Return the transformed console.log statement with index pushing logic as text
                        return `console.log("Swapping:", arr[${first}], arr[${third}]);\nindexArray.push({ index1: ${first}, index2: ${third} }`;
                    });
            }
        
            // Modify the code by inserting console.log statements
            const modifiedCode = code
                .replace(ifPattern, (match, condition) => {
                    // Add console.log before the if statement
                    return `console.log("Running if (${condition.trim()})"); ${match}`;
                })
                .replace(swapPattern, (match) => {
                    // Log the entire swap statement
                    return `console.log("Swapping: ${match.trim()}"); ${match}`;
                });
        
            // Transform logs for if statements and swaps
            const transformedCode = transformLog(modifiedCode);
            const fullyTransformedCode = transformSwapLog(transformedCode);
        
            // // Output the modified code
            // output.innerHTML = "<strong>Modified Code:</strong><br><pre>" + fullyTransformedCode + "</pre><br>";
            codeToBreakDown = fullyTransformedCode;
            console.log(fullyTransformedCode);
        
            // Execute the modified code in a safe context
            try {
                const sortFunction = new Function('arr', fullyTransformedCode + ' return arr;');
                const sampleArray = [64, 34, 25, 12, 22, 11, 90]; // Example array
                const sortedArray = sortFunction(sampleArray);
                
                // output.innerHTML += `<strong>Sorted Array:</strong> ${sortedArray.join(', ')}<br>`;
            } catch (error) {
                console.error("Error executing modified code:", error);
                // output.innerHTML += "Error executing modified code. Check the console for details.";
            }
        }
        let codeToBreakDown;



        function runcode(code) {
            try {
                eval(code);
                
        
                // Log every index of indexArray
                indexArray.forEach((value, index) => {
                    console.log(`Index: ${index}, Value: ${value}`);
                });

        
            } catch (error) {
                console.error("Error executing code:", error);
            }
        }
        


        // Define the transformation function
function transformIndexArray(indexArray) {
    return indexArray.map(item => {
      const { index1, index2, sign } = item;
      const output = { who: "hero" };
  
      if (sign) {
        if (sign === "<") {
          return { ...output, type: "compareTwoItems", itemIndex1: index1, itemIndex2: index2, comparisonSign: "<" };
        } else {
          return { ...output, type: "compareTwoItems", itemIndex1: index1, itemIndex2: index2, comparisonSign: ">" };
        }
      } else {
        // No sign means swapTwoItems
        return { ...output, type: "swapTwoItems", itemIndex1: index1, itemIndex2: index2 };
      }
    }).flatMap(item => {
      if (item.type === "compareTwoItems") {
        const compareValue = Math.max(item.itemIndex1, item.itemIndex2);
        if (compareValue > 9) {
          return [{ type: "compareItemToValue", itemIndex: item.itemIndex1, compareValue: compareValue, comparisonSign: "<", who: "hero" }];
        }
      }
      return item;
    });
  }




        
function displayError(error) {
    const errorOutput = document.getElementById('errorOutput');
    errorOutput.textContent = error; // Display the error message
}

document.getElementById('languageSelect').addEventListener('change', function() {
    updateLanguage(this.value, level);
});

function updateLanguage(language, level) {
    currentLanguage = language;
    const sampleCode = getSampleCode(language, level);
  
    console.log('Language set to:', currentLanguage);
    updateCompilerContent(sampleCode);
    populateOperatorOptions(language);
}
        document.addEventListener('DOMContentLoaded', function() {

            
    const languageSelect = document.getElementById('languageSelect');
    languageSelect.value = 'cpp'; // Set default language to C++
    
    // Wait for the iframe to load before updating the content
    const iframe = document.getElementById('oc-editor');
    iframe.onload = function() {
        const sampleCode = getSampleCode(languageSelect.value);
        updateCompilerContent(sampleCode); // Populate options and set initial code
    };
});
        function populateOperatorOptions(language) {
            const operatorSelect = document.getElementById('operator');
            operatorSelect.innerHTML = ''; // Clear existing options
            operatorOptions[language].forEach(operator => {
                const option = document.createElement('option');
                option.value = operator;
                option.textContent = operator;
                operatorSelect.appendChild(option);
            });
        }

        level;

        const levelElement = document.getElementById("globalLevel");
        if (levelElement) {
          levelElement.textContent = level;
        }





        
    function getSampleCode(language, level) {
    switch (language) {
        case 'php':
            return level === 1 ? "<?php\n    echo 'Hello World!';\n?>" :
                   level === 2 ? "<?php\n    for ($i = 0; $i < 5; $i++) {\n        echo 'Number: ' . $i;\n    }\n?>" :
                   "<?php\n    function greet() {\n        return 'Hello!';\n    }\n?>";
        case 'java':
            return level === 1 ? "public class HelloWorld {\n    public static void main(String[] args) {\n        System.out.println(\"Hello World!\");\n    }\n}" :
                   level === 2 ? "public class Numbers {\n    public static void main(String[] args) {\n        for (int i = 0; i < 5; i++) {\n            System.out.println(i);\n        }\n    }\n}" :
                   "public class Greeting {\n    public static String greet() {\n        return \"Hello!\";\n    }\n}";
        case 'cpp':
            return level === 1 ? "#include <iostream>\nusing namespace std;\nint main() {\n    cout << 'Hello World!' << endl;\n    return 0;\n}" :
                   level === 2 ? "#include <iostream>\nusing namespace std;\nint main() {\n    for (int i = 0; i < 5; i++) {\n        cout << i << endl;\n    }\n    return 0;\n}" :
                   "#include <iostream>\nusing namespace std;\nvoid greet() {\n    cout << \"Hello!\" << endl;\n}";
        case 'javascript':
            return level === 1 ? "console.log('Hello World!');" :
                   level === 2 ? "for (let i = 0; i < 5; i++) {\n    console.log(i);\n}" :
                   "function greet() {\n    return 'Hello!';\n}";
        case 'python':
            return level === 1 ? "print('Hello World!')" :
                   level === 2 ? "for i in range(5):\n    print(i)" :
                   "def greet():\n    return 'Hello!'";
        default:
            return '';
    }
}


        function allowDrop(event) {
            event.preventDefault();
            const rect = dropzone.getBoundingClientRect();

            // Calculate where to position the indicator
            const mouseY = event.clientY - rect.top;
            const line = Math.floor(mouseY / lineHeight);
            const indicatorPosition = Math.max(0, Math.min(line * lineHeight, dropzone.clientHeight - 2)-10); // Clamp the position

            // Show and position the indicator
            indicator.style.display = 'block';
            indicator.style.top = `${indicatorPosition}px`;
        }

        function drag(event) {
            const snippet = event.target.dataset.snippet; // Access the data-snippet
            event.dataTransfer.setData("text", snippet); // Store the snippet value
            isDragging = true;
            dropzone.style.display = 'flex'; // Show the dropzone when dragging starts
        }


        function drop(event) {
            console.log("LEVBEL IS ", level);
            event.preventDefault();
            // window.overworld.runCutscene();
            const iframe = document.getElementById('oc-editor');

            data = event.dataTransfer.getData("text");
            lineNumber = Math.floor((event.clientY - dropzone.getBoundingClientRect().top) / lineHeight) - 2;

            isMessageHandlingEnabled = true;
            window.addEventListener('message', handleIncomingMessage);

            iframe.contentWindow.postMessage({
                eventType: 'triggerRun'
            }, "*");

            // Hide the indicator and dropzone after drop
            resetDropzone();
        }





        function resetDropzone() {
            indicator.style.display = 'none';
            dropzone.style.display = 'none';
            isDragging = false;
        }

        // Hide the indicator when the drag ends
        document.addEventListener('dragend', resetDropzone);

        // Use requestAnimationFrame for smoother updates
        document.addEventListener('dragover', (event) => {
            if (isDragging) {
                requestAnimationFrame(() => allowDrop(event));
            }
        });

        function getCodeSnippet(snippet) {
            if (snippet === 'comparison') {
                const firstOperand = document.getElementById('firstOperand').value.trim() || 'variable1';
                const operator = document.getElementById('operator').value;
                const secondOperand = document.getElementById('secondOperand').value.trim() || 'variable2';
                return `${firstOperand} ${operator} ${secondOperand}`;
            }

            if (snippet === 'for') {
                const forInit = document.getElementById('forInit').value.trim() || 'int i = 0';
                const forCondition = document.getElementById('forCondition').value.trim() || 'i < n';
                const forUpdate = document.getElementById('forUpdate').value.trim() || 'i++';

                switch (currentLanguage) {
                    case 'cpp':
                    case 'java':
                        return `for (${forInit}; ${forCondition}; ${forUpdate}) {\n    // code\n}`;
                    case 'python':
                        return `for ${forInit} in range(${forCondition}):\n    # code`;
                    case 'javascript':
                        return `for (${forInit}; ${forCondition}; ${forUpdate}) {\n    // code\n}`;
                    case 'php':
                        return `for (${forInit}; ${forCondition}; ${forUpdate}) {\n    // code\n}`;
                    default:
                        return '';
                }
            }

            switch (snippet) {
                case 'if':
                    return currentLanguage === 'cpp' ? 
                        "if (condition) {\n    // code\n}" :
                        currentLanguage === 'java' ? 
                        "if (condition) {\n    // code\n}" :
                        currentLanguage === 'python' ? 
                        "if condition:\n    # code" :
                        currentLanguage === 'javascript' ? 
                        "if (condition) {\n    // code\n}" :
                        currentLanguage === 'php' ? 
                        "if ($condition) {\n    // code\n}" : '';
                case 'for':
                    return currentLanguage === 'cpp' ? 
                        "for (int i = 0; i < n; i++) {\n    // code\n}" :
                        currentLanguage === 'java' ? 
                        "for (int i = 0; i < n; i++) {\n    // code\n}" :
                        currentLanguage === 'python' ? 
                        "for i in range(n):\n    # code" :
                        currentLanguage === 'javascript' ? 
                        "for (let i = 0; i < n; i++) {\n    // code\n}" :
                        currentLanguage === 'php' ? 
                        "for ($i = 0; $i < $n; $i++) {\n    // code\n}" : '';
                case 'while':
                    return currentLanguage === 'cpp' ? 
                        "while (condition) {\n    // code\n}" :
                        currentLanguage === 'java' ? 
                        "while (condition) {\n    // code\n}" :
                        currentLanguage === 'python' ? 
                        "while condition:\n    # code" :
                        currentLanguage === 'javascript' ? 
                        "while (condition) {\n    // code\n}" :
                        currentLanguage === 'php' ? 
                        "while ($condition) {\n    // code\n}" : '';
                default:
                    return '';
            }
        }

        function handleIncomingMessage(e) {
            if (isMessageHandlingEnabled) {
                console.log('Received message:', e.data);

                if (e.data && e.data.files && e.data.files.length > 0) {
                    const file = e.data.files[0];
                    let codeLines = file.content.split("\n");

                    let codeToAdd = getCodeSnippet(data);
                    const insertNewLine = document.getElementById('nextLineToggle').checked;

                    // Add a newline if toggle is checked
                    if (insertNewLine) {
                        codeToAdd = "\n" + codeToAdd;
                    }
                    const lineToUpdate = lineNumber - 1;

                    if (lineNumber <= codeLines.length) {
                        // Check if the line contains a conditional or loop statement
                        if (codeLines[lineToUpdate].includes("if") || codeLines[lineToUpdate].includes("while")) {
                            console.log("A CONDITIONAL");
                            if (codeLines[lineToUpdate].includes("==") ||
                                codeLines[lineToUpdate].includes("!=") ||
                                codeLines[lineToUpdate].includes("!<") ||
                                codeLines[lineToUpdate].includes("!>") ||
                                codeLines[lineToUpdate].includes("<") ||
                                codeLines[lineToUpdate].includes(">")) {
                                console.log("LOL ALREADY HASHAS LOGIC");
                                codeLines[lineToUpdate] = codeLines[lineToUpdate].replace(/\(([^)]*)\)/, `($1 && ${codeToAdd})`);
                            }
                            codeLines[lineToUpdate] = codeLines[lineToUpdate].replace(/\(\s*\)/, `(${codeToAdd})`);
                            codeLines[lineToUpdate] = codeLines[lineToUpdate].replace(/condition/, codeToAdd);
                        } else {
                            codeLines[lineToUpdate] += " " + codeToAdd;
                        }
                    } else {
                        codeLines[codeLines.length - 1] += " \n" + codeToAdd;
                    }

                    const updatedCode = codeLines.join("\n");
                    updateCompilerContent(updatedCode);
                }

                isMessageHandlingEnabled = false;
                window.removeEventListener('message', handleIncomingMessage);
            }
        }

        function updateCompilerContent(content) {
            console.log("wow updated");
            if (content) {
                const iframe = document.getElementById('oc-editor');
                iframe.contentWindow.postMessage({
                    eventType: 'populateCode',
                    language: currentLanguage,
                    files: [
                        {
                            "name": currentLanguage + (currentLanguage === 'cpp' ? '.cpp' : currentLanguage === 'java' ? '.java' : currentLanguage === 'php' ? '.php' : currentLanguage === 'javascript' ? '.js' : '.py'),
                            "content": content
                        }
                    ]
                }, "*");
            }
        }
