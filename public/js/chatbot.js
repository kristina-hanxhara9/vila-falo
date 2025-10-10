/**
 * Vila Falo Chatbot Widget
 * A modern, responsive chatbot widget with Albanian language support
 */

class VilaFaloChatbot {
    constructor(options = {}) {
        this.options = {
            apiEndpoint: '/api/chatbot',
            position: 'bottom-right',
            theme: 'default',
            language: 'sq', // Albanian by default
            autoOpen: false,
            showNotification: true,
            welcomeMessage: true,
            ...options
        };

        this.isOpen = false;
        this.sessionId = null;
        this.conversationHistory = [];
        this.isTyping = false;

        this.init();
    }

    init() {
        this.createWidget();
        this.attachEventListeners();
        this.loadPopularQuestions();
        
        if (this.options.autoOpen) {
            setTimeout(() => this.openChat(), 1000);
        }
    }

    createWidget() {
        // Create main container
        this.container = document.createElement('div');
        this.container.className = 'vila-chatbot';
        this.container.innerHTML = this.getWidgetHTML();

        // Append to body
        document.body.appendChild(this.container);

        // Get references to elements
        this.toggleBtn = this.container.querySelector('.chatbot-toggle');
        this.chatWindow = this.container.querySelector('.chatbot-window');
        this.messagesContainer = this.container.querySelector('.chatbot-messages');
        this.inputField = this.container.querySelector('.chatbot-input');
        this.sendBtn = this.container.querySelector('.chatbot-send');
        this.closeBtn = this.container.querySelector('.chatbot-close');

        // Load CSS if not already loaded
        if (!document.querySelector('link[href*="chatbot.css"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = '/css/chatbot.css';
            document.head.appendChild(link);
        }
    }

    getWidgetHTML() {
        return `
            <div class="chatbot-window">
                <div class="chatbot-header">
                    <div class="chatbot-header-content">
                        <div class="chatbot-avatar">🏔️</div>
                        <div>
                            <div class="chatbot-title">Vila Falo Assistant</div>
                            <div class="chatbot-subtitle">Jemi këtu për t'ju ndihmuar</div>
                        </div>
                    </div>
                    <button class="chatbot-close" aria-label="Mbyll chatbot">✕</button>
                </div>
                
                <div class="chatbot-messages">
                    ${this.options.welcomeMessage ? this.getWelcomeMessage() : ''}
                </div>
                
                <div class="chatbot-input-container">
                    <div class="chatbot-input-wrapper">
                        <textarea 
                            class="chatbot-input" 
                            placeholder="Shkruani mesazhin tuaj këtu..."
                            rows="1"
                            maxlength="500"
                        ></textarea>
                        <button class="chatbot-send" aria-label="Dërgo mesazh">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M2,21L23,12L2,3V10L17,12L2,14V21Z" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            
            <button class="chatbot-toggle" aria-label="Hap chatbot">
                <span class="chatbot-toggle-icon">💬</span>
                ${this.options.showNotification ? '<div class="chatbot-notification">1</div>' : ''}
            </button>
        `;
    }

    getWelcomeMessage() {
        return `
            <div class="chatbot-welcome">
                <h4>Mirë se erdhët në Vila Falo! 🏔️</h4>
                <p>Unë jam asistenti juaj virtual. Mund të ju ndihmoj me informacione për dhomat, aktivitetet, çmimet dhe çdo gjë tjetër që ju nevojitet për qëndrimin tuaj në resortin tonë malor. Për rezervime, ju lutemi përdorni formularin e rezervimit në faqe.</p>
            </div>
            <div class="quick-questions" id="quickQuestions">
                <div class="quick-question" data-question="Sa kushton një dhomë për natë?">💰 Çmimet</div>
                <div class="quick-question" data-question="Çfarë aktivitetesh keni?">🎿 Aktivitete</div>
                <div class="quick-question" data-question="Ku ndodheni?">📍 Vendndodhja</div>
                <div class="quick-question" data-question="Çfarë ofron mëngjesi?">☕ Mëngjesi</div>
            </div>
        `;
    }

    attachEventListeners() {
        // Toggle chat window
        this.toggleBtn.addEventListener('click', () => this.toggleChat());
        this.closeBtn.addEventListener('click', () => this.closeChat());

        // Send message
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize textarea
        this.inputField.addEventListener('input', () => this.autoResizeTextarea());

        // Quick questions
        this.messagesContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('quick-question')) {
                const question = e.target.getAttribute('data-question');
                this.inputField.value = question;
                this.sendMessage();
            }
        });

        // Click outside to close (optional)
        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.container.contains(e.target)) {
                // Optionally close when clicking outside
                // this.closeChat();
            }
        });

        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.closeChat();
            }
        });
    }

    async loadPopularQuestions() {
        try {
            const response = await fetch(`${this.options.apiEndpoint}/popular-questions`);
            const data = await response.json();
            
            if (data.success && data.data) {
                // Update quick questions if needed
                this.popularQuestions = data.data;
            }
        } catch (error) {
            console.warn('Could not load popular questions:', error);
        }
    }

    toggleChat() {
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }

    openChat() {
        this.isOpen = true;
        this.chatWindow.classList.add('active');
        this.toggleBtn.classList.add('active');
        
        // Hide notification
        const notification = this.container.querySelector('.chatbot-notification');
        if (notification) {
            notification.style.display = 'none';
        }

        // Focus input
        setTimeout(() => {
            this.inputField.focus();
        }, 300);

        // Scroll to bottom
        this.scrollToBottom();
    }

    closeChat() {
        this.isOpen = false;
        this.chatWindow.classList.remove('active');
        this.toggleBtn.classList.remove('active');
    }

    async sendMessage() {
        const message = this.inputField.value.trim();
        if (!message || this.isTyping) return;

        // Clear input
        this.inputField.value = '';
        this.autoResizeTextarea();

        // Add user message to chat
        this.addMessage(message, 'user');

        // Show typing indicator
        this.showTypingIndicator();

        try {
            const response = await fetch(`${this.options.apiEndpoint}/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    sessionId: this.sessionId
                })
            });

            const data = await response.json();

            if (data.success) {
                this.sessionId = data.sessionId;
                
                // Remove typing indicator
                this.hideTypingIndicator();
                
                // Add bot response
                this.addMessage(data.message, 'bot', {
                    hasAvailabilityCheck: data.hasAvailabilityCheck,
                    availabilityData: data.availabilityData
                });
            } else {
                throw new Error(data.message || 'Ka ndodhur një gabim');
            }

        } catch (error) {
            console.error('Chatbot error:', error);
            this.hideTypingIndicator();
            this.addMessage(
                'Na vjen keq, kam probleme teknike. Ju lutem provoni përsëri ose na kontaktoni në vilafalo@gmail.com',
                'bot',
                { isError: true }
            );
        }
    }

    addMessage(text, sender, options = {}) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message ${sender}`;
        
        const time = new Date().toLocaleTimeString('sq-AL', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        let messageContent = `
            <div class="chatbot-message-avatar">
                ${sender === 'bot' ? '🏔️' : '👤'}
            </div>
            <div class="chatbot-message-content">
                <p class="chatbot-message-text">${this.formatMessage(text)}</p>
                ${options.hasAvailabilityCheck ? this.formatAvailabilityData(options.availabilityData) : ''}
                <div class="chatbot-message-time">${time}</div>
            </div>
        `;

        messageDiv.innerHTML = messageContent;
        
        if (options.isError) {
            messageDiv.classList.add('error');
        }

        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();

        // Store in conversation history
        this.conversationHistory.push({
            text: text,
            sender: sender,
            timestamp: new Date(),
            ...options
        });
    }

    formatMessage(text) {
        // Simple formatting for URLs, line breaks, etc.
        return text
            .replace(/\n/g, '<br>')
            .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }

    formatAvailabilityData(data) {
        if (!data || !data.rooms) return '';

        let html = '<div class="availability-info">';
        html += '<div class="availability-header">📅 Disponueshmëria për datat e zgjedhura:</div>';
        
        data.rooms.forEach(room => {
            const statusClass = room.available ? 'available' : 'unavailable';
            const statusText = room.available ? 
                `${room.availableRooms}/${room.totalRooms} të disponueshme` : 
                'Nuk ka vende të lira';
            
            html += `
                <div class="availability-item">
                    <div class="availability-room">${room.roomName}</div>
                    <div class="availability-status ${statusClass}">${statusText}</div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }

    showTypingIndicator() {
        if (this.isTyping) return;
        
        this.isTyping = true;
        const typingDiv = document.createElement('div');
        typingDiv.className = 'chatbot-message bot typing-indicator-wrapper';
        typingDiv.innerHTML = `
            <div class="chatbot-message-avatar">🏔️</div>
            <div class="typing-indicator">
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        
        this.messagesContainer.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        this.isTyping = false;
        const typingIndicator = this.messagesContainer.querySelector('.typing-indicator-wrapper');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    autoResizeTextarea() {
        this.inputField.style.height = 'auto';
        this.inputField.style.height = Math.min(this.inputField.scrollHeight, 80) + 'px';
    }

    scrollToBottom() {
        setTimeout(() => {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }, 100);
    }

    // Public API methods
    show() {
        this.openChat();
    }

    hide() {
        this.closeChat();
    }

    sendCustomMessage(message) {
        this.inputField.value = message;
        this.sendMessage();
    }

    clearConversation() {
        // Keep welcome message but clear conversation
        const welcomeMessage = this.messagesContainer.querySelector('.chatbot-welcome');
        const quickQuestions = this.messagesContainer.querySelector('.quick-questions');
        
        this.messagesContainer.innerHTML = '';
        
        if (welcomeMessage) {
            this.messagesContainer.appendChild(welcomeMessage);
        }
        if (quickQuestions) {
            this.messagesContainer.appendChild(quickQuestions);
        }
        
        this.conversationHistory = [];
        
        // Clear session
        if (this.sessionId) {
            fetch(`${this.options.apiEndpoint}/session/${this.sessionId}`, {
                method: 'DELETE'
            }).catch(console.warn);
        }
        this.sessionId = null;
    }

    destroy() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
    }
}

// Auto-initialize if in browser environment
if (typeof window !== 'undefined') {
    // Wait for both DOM and page load, plus loader to disappear
    function initializeChatbot() {
        // Check if loader is still visible
        const loader = document.querySelector('.loader');
        if (loader) {
            const isHidden = loader.classList.contains('hidden') || 
                           loader.style.opacity === '0' || 
                           loader.style.visibility === 'hidden' ||
                           loader.style.display === 'none';
            
            if (!isHidden) {
                // Wait a bit more and try again
                setTimeout(initializeChatbot, 500);
                return;
            }
        }
        
        // Initialize chatbot only after loader is gone
        try {
            window.vilaFaloChatbot = new VilaFaloChatbot();
            console.log('Vila Falo Chatbot initialized successfully');
        } catch (error) {
            console.error('Error initializing chatbot:', error);
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            // Wait for loader to disappear (loader hides after 3 seconds)
            setTimeout(initializeChatbot, 3500);
        });
    } else {
        // DOM already loaded, but still wait for loader
        setTimeout(initializeChatbot, 3500);
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VilaFaloChatbot;
}
