const terminal = document.getElementById('terminal');
const commandInput = document.getElementById('command-input');

function addPromptLine() {
    const promptLine = document.createElement('div');
    promptLine.className = 'prompt-line';
    promptLine.innerHTML = `
    <span class="user">skylineos</span><span class="user-e"> / # </span>
    <input type="text" class="command-input" autofocus>
    `;

    terminal.appendChild(promptLine);

    const newInput = promptLine.querySelector('.command-input');
    newInput.focus();
    newInput.addEventListener('keydown', handleCommand);
}

function handleCommand(e){
    if (e.key === 'Enter') {
        const input = e.target.value.trim();
        e.target.disabled = true;

        if (input) {
            const [command, ...args] = input.split(' ');

            if (commands[command]) {
                const result = commands[command](args);
                if (result !== null && result !== '') {
                    addOutput(result);
                } 
            } else if (command) {
                    addOutput(`${command}: command not found`, 'error');
                }
            }

            addPromptLine();
            terminal.scrollTop = terminal.scrollHeight;
        }
}


function addOutput(text, className = 'output') {
    if (text === null) return;

    const output = document.createElement('div');
    output.className = className;
    output.textContent = text;
    output.style.whiteSpace = 'pre-wrap';
    terminal.appendChild(output);
}

const commands = {
    help: () => {
        return `Available commands:
        help - show this help message
        echo [text] - display text
        clear - clear terminal
        whoami - display current user
        date - show current system time and date
        uname - system information
        hello - say hello`;
    },
    echo: (args) => args.join(' '),
    clear: () => {
        terminal.innerHTML = '';
        addPromptLine();
        return null;
    },
    whoami: () => 'skylineos',
    date: () => new Date().toString(),
    uname: () => 'SkylineOS 1.0.0 - the operating system that will take your efficiency to the skies\nCommands will be similar to BASH, but basic.\nA project created for the Hack Club Summer of Making event.',
    hello: () => 'hello! :D'
};

commandInput.addEventListener('keydown', handleCommand);
commandInput.focus();

commandInput.addEventListener('click', () => {
    const activeInput = terminal.querySelector('.command-input:not([disabled])');
    if (activeInput) activeInput.focus();
});
