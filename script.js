const chatArea = document.getElementById('chat-area');
const userInput = document.getElementById('user-input');

userInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const userMessage = userInput.value;
        appendMessage('user', userMessage);
        processMessage(userMessage.toLowerCase());
        userInput.value = '';
    }
});

function processMessage(message) {
    if (message.includes('hi') || message.includes('hello')) {
        setTimeout(() => {
            appendMessage('bot', 'Hi there!');
        }, 500);
    } else if (message.includes('how are you')) {
        setTimeout(() => {
            appendMessage('bot', "I'm just a bot, but I'm functioning well! How can I assist you?");
        }, 500);

    } else if (message.includes('suggest some crops type for my region')) {
            setTimeout(() => {
                appendMessage('bot', "according to your region there are some cropes like vegetables,fruits");
            }, 500);
        
    } else if (message.includes('what is the required PH level for soil')) {
        setTimeout(() => {
            appendMessage('bot', 'The pH scale ranges from 0 to 14, with pH 7 being neutral. A pH value less than 7 indicates acidic soil, while a pH value greater than 7 indicates alkaline or basic soil. ');
        }, 500);
    } else if (message.includes('what kind of weather good for cropes')) {
        setTimeout(() => {
            appendMessage('bot', ' temperatures between 60°F to 80°F,Different crops have varying humidity preferences, but generally, moderate humidity levels are favorable for plant growth,6 to 8 hours of sunlight per day.');
        }, 500);
    } else if (message.includes('what kind of soil moisture is required for cropes')) {
        setTimeout(() => {
            appendMessage('bot', ' While proper rainfall or irrigation is essential, well-draining soil is equally important. Saturated soil can lead to waterlogged conditions, which can be detrimental to many crops.');
        }, 500);
    } else {
        setTimeout(() => {
            appendMessage('bot', "Thank You ,I Guess these information is really  benefitial for your farming.");
        }, 500);
    
    }
}

function appendMessage(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('chat-message', sender === 'bot' ? 'bot' : 'user');
    messageElement.innerText = message;
    chatArea.appendChild(messageElement);
    chatArea.scrollTop = chatArea.scrollHeight;
}
