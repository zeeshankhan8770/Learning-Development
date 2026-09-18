"use strict";

/* ==========================================================================
GLOBAL SELECTORS
========================================================================== */

let chatWindow, chatInput, sendButton, ToggleMenuButton;

const keywordMap = {};

const chatFlow = {};

const chatAvatarPath = document.getElementById('chat-avatar').getAttribute('src');

const isArabic = document.documentElement.lang === 'ar';

/* ==========================================================================
PROJECTS SECTION FLOW
========================================================================== */

const initializeProjectsFlow = () => {
    const projectsEl = document.getElementById('flow-projects');
    if (!projectsEl) return;
    const flowId = 'projects';
    const projectsData = Array.from(projectsEl.querySelectorAll('.project-item')).map(item => {
        const mediaType = item.getAttribute('data-media');
        const projectObj = {
            title: item.getAttribute('data-title'),
            summary: item.querySelector('.summary').innerHTML.trim(),
            link: item.getAttribute('data-link'),
            image: item.getAttribute('data-image'),
            mediaType: mediaType
        };
        if (mediaType === 'gallery') {
            projectObj.gallery = Array.from(item.querySelectorAll('.gallery-urls img')).map(s => s.getAttribute('src'));
        } else if (mediaType === 'youtube') {
            projectObj.youtubeId = item.getAttribute('data-youtube-id');
        } else if (mediaType === 'video') {
            projectObj.videoUrl = item.getAttribute('data-video-url');
        }
        return projectObj;
    });
    chatFlow[flowId] = [{
        speaker: 'A',
        text: projectsEl.querySelector('.intro').innerHTML.trim(),
        type: 'projects-sequence', 
        data: projectsData,
        globalButtons: Array.from(projectsEl.querySelectorAll('.project-buttons .global li')).map(li => ({
            text: li.innerText, action: li.getAttribute('data-action'), styleClass: li.getAttribute('data-class') || ""
        })),
        finalButtons: Array.from(projectsEl.querySelectorAll('.project-buttons .final li')).map(li => ({
            text: li.innerText, action: li.getAttribute('data-action'), styleClass: li.getAttribute('data-class') || ""
        }))
    }];
    const triggers = projectsEl.getAttribute('data-triggers').split(',').map(t => t.trim().toLowerCase());
    triggers.forEach(t => { keywordMap[t] = flowId; });
};

/* ==========================================================================
DISPLAYING NEXT PROJECT
========================================================================== */

let currentProjectIndex = 0;
let projectsSequenceData = [];
let sequenceGlobalButtons = [];
let sequenceFinalButtons = [];
const startProjectsSequence = async (projects, globalButtons, finalButtons) => {
    projectsSequenceData = projects;
    sequenceGlobalButtons = globalButtons;
    sequenceFinalButtons = finalButtons;
    currentProjectIndex = 0; 
    await displayNextProject();
};
const displayNextProject = async () => {
    const project = projectsSequenceData[currentProjectIndex];
    if (!project) return;
    const totalProjects = projectsSequenceData.length;
    const introAnnouncement = isArabic ? `المشروع ${currentProjectIndex + 1} من ${totalProjects} : **${project.title}**` : `Project ${currentProjectIndex + 1} of ${totalProjects} : **${project.title}**`;
    const nextBtnText = isArabic ? "المشروع التالي" : "Show Next Project";
    const isLast = currentProjectIndex === totalProjects - 1;
    const navButtons = isLast ? [] : [{ 
        text: nextBtnText, 
        action: `__project_flow${currentProjectIndex + 1}` 
    }];
    const extraButtons = isLast ? sequenceFinalButtons : sequenceGlobalButtons;
    const tempFlowId = `temp_proj_${Date.now()}`;
    chatFlow[tempFlowId] = [
        {
            speaker: 'A',
            text: introAnnouncement,
            delay: 300
        },
        {
            speaker: 'A',
            isRich: true,
            type: 'single-project-card',
            projectData: project,
            options: [...navButtons, ...extraButtons],
            delay: 200
        }
    ];
    await startConversationFlow(tempFlowId);
};

/* ==========================================================================
CLIENTS SECTION FLOW
========================================================================== */

const initializeClientsFlow = () => {
    const clientsEl = document.getElementById('flow-clients');
    if (!clientsEl) return;
    const logoItems = Array.from(clientsEl.querySelectorAll('.client-item')).map(div => ({
        name: div.getAttribute('data-name'),
        logoUrl: div.getAttribute('data-logo')
    }));
    chatFlow['clients'] = [{
        speaker: 'A',
        text: clientsEl.querySelector('.intro')?.innerHTML.trim() || "",
        type: 'client-logos',
        logos: logoItems,
        options: Array.from(clientsEl.querySelectorAll('.options li')).map(li => ({
            text: li.innerText,
            action: li.getAttribute('data-action'),
            link: li.getAttribute('data-link'),
            styleClass: li.getAttribute('data-class') || ""
        }))
    }];
    const triggers = clientsEl.getAttribute('data-triggers').split(',').map(t => t.trim().toLowerCase());
    triggers.forEach(t => { keywordMap[t] = 'clients'; });
};

/* ==========================================================================
CONTACT SECTION FLOW
========================================================================== */

const initializeContactFlow = () => {
    const contactEl = document.getElementById('flow-contact');
    if (!contactEl) return;
    const directItems = Array.from(contactEl.querySelectorAll('.direct-contact .contact-row')).map(div => ({
        label: div.getAttribute('data-label'),
        icon: div.getAttribute('data-icon'),
        value: div.innerText.trim()
    }));
    const socialItems = Array.from(contactEl.querySelectorAll('.social-links .social-item')).map(div => ({
        icon: div.getAttribute('data-icon'),
        url: div.getAttribute('data-url'),
        class: div.getAttribute('data-class')
    }));
    chatFlow['contact'] = [{
        speaker: 'A',
        text: contactEl.querySelector('.intro')?.innerHTML.trim() || "",
        type: 'contact-details',
        direct: directItems,
        socials: socialItems,
        options: Array.from(contactEl.querySelectorAll('.options li')).map(li => ({
            text: li.innerText,
            action: li.getAttribute('data-action'),
            styleClass: li.getAttribute('data-class') || ""
        }))
    }];
    const triggers = contactEl.getAttribute('data-triggers').split(',').map(t => t.trim().toLowerCase());
    triggers.forEach(t => { keywordMap[t] = 'contact'; });
};

/* ==========================================================================
GENERIC FLOWS
========================================================================== */

const initializeGenericFlows = () => {
    const flows = document.querySelectorAll('.generic-flow, #flow-msg-success');
    flows.forEach(flowEl => {
        const flowId = flowEl.getAttribute('data-flow-id') || flowEl.id.replace('flow-', '');
        const contentBlocks = Array.from(flowEl.children)
            .filter(child => !child.classList.contains('options'))
            .map(child => {
                const block = {
                    tag: child.tagName,
                    className: child.className,
                };
                if (child.tagName === 'UL') {
                    block.items = Array.from(child.querySelectorAll('li')).map(li => li.innerHTML.trim());
                } else {
                    block.content = child.innerHTML.trim();
                }
                return block;
            });
        const optionItems = Array.from(flowEl.querySelectorAll('.options li')).map(li => ({
            text: li.innerText.trim(),
            action: li.getAttribute('data-action'),
            link: li.getAttribute('data-link'),
            styleClass: li.getAttribute('data-class') || ""
        }));
        chatFlow[flowId] = [{
            speaker: 'A',
            type: 'flexible-content',
            blocks: contentBlocks,
            options: optionItems
        }];
        const triggerAttr = flowEl.getAttribute('data-triggers');
        if (triggerAttr) {
            triggerAttr.split(',').map(t => t.trim().toLowerCase()).forEach(t => { 
                keywordMap[t] = flowId; 
            });
        }
    });
};

/* ==========================================================================
INITIALIZE FLOWS
========================================================================== */

function initializeFlows() {
    initializeClientsFlow();
    initializeContactFlow();
    initializeGenericFlows();
    initializeProjectsFlow();
}

/* ==========================================================================
The main async engine that iterates through message arrays.
========================================================================== */

const startConversationFlow = async (flowId) => {
    if (!flowId || flowId === '__handled') return;
    if (!chatInput) chatInput.disabled = false;
    if (!ToggleMenuButton) ToggleMenuButton = document.getElementById('btn-menu-toggle');
    const flow = chatFlow[flowId];
    let isFirstMessage = true;
    if (!flow) return;
    const navLinks = document.querySelectorAll('.btn-primary-nav');
    const input_nav_wrapper = document.getElementById('input-nav-wrapper');
    if(input_nav_wrapper) input_nav_wrapper.classList.add('disabled');
    navLinks.forEach(link => link.classList.add('disabled'));
    if(chatInput) chatInput.disabled = true;
    if(sendButton) sendButton.disabled = true;
    if(ToggleMenuButton) ToggleMenuButton.disabled = true;
    for (const message of flow) {
        let textToDisplay = message.text || "";
        await new Promise(async resolve => {
            if (message.speaker === 'A') {
                await new Promise(r => setTimeout(r, message.delay || 500));
                const typingIndicator = showTypingIndicator(isFirstMessage);
                await new Promise(r => setTimeout(r, 1100));
                await hideTypingIndicator(typingIndicator);
                const messageElement = createMessageElement(message, isFirstMessage);
                isFirstMessage = false;
                const bubble = messageElement.querySelector('.message-bubble');
                bubble.style.opacity = "0";
                bubble.style.transition = "all 0.3s ease-out";
                chatWindow.appendChild(messageElement);
                const icon = messageElement.querySelector('i, .chat-avatar');
                if (icon) {
                    if (icon.tagName === 'IMG') {
                        await new Promise(resolve => {
                            if (icon.complete) resolve();
                            else icon.onload = resolve;
                        });
                    } else {
                        await new Promise(r => setTimeout(r, 30)); 
                    }
                }
                requestAnimationFrame(() => {
                    bubble.style.opacity = "1";
                });
                if (message.type === 'projects-sequence') {
                    if (message.text) {
                        await typeWriterEffect(bubble, message.text);
                    }
                    await startProjectsSequence(message.data, message.globalButtons, message.finalButtons);
                } else if (message.type === 'contact-details') {
                    await typeWriterEffect(bubble, message.text);
                    await typeContactSocials(bubble, message); 
                } else if (message.type === 'flexible-content') {
                    bubble.classList.add('rich-paragraph');
                    for (const block of message.blocks) {
                        const el = document.createElement(block.tag.toLowerCase());
                        if (block.className) {
                            el.className = block.className;
                        }
                        bubble.appendChild(el);
                        if (block.tag === 'UL') {
                            for (const liText of block.items) {
                                const li = document.createElement('li');
                                el.appendChild(li);
                                await typeWriterEffect(li, liText);
                                await new Promise(r => setTimeout(r, 200));
                            }
                        } else {
                            await typeWriterEffect(el, block.content);
                        }
                        await new Promise(r => setTimeout(r, 200));
                    }
                } else if (!message.isRich) {
                    await typeWriterEffect(bubble, textToDisplay);
                }
                if (message.options || message.contextualOptions) {
                    const isAsyncRich = (message.isRich && 
                        (message.project?.type === 'client-logos' || message.project?.type === 'single-project-card')) 
                        || message.type === 'client-logos'
                        || message.type === 'contact-details';
                    if (!isAsyncRich) {
                        renderOptions(message.options || message.contextualOptions, messageElement, false);
                    }
                }
            } else {
                chatWindow.appendChild(createMessageElement(message));
            }
            scrollToBottom();
            resolve();
        });
    }
    input_nav_wrapper.classList.remove('disabled');
    navLinks.forEach(link => link.classList.remove('disabled'));
    if(chatInput) {
        chatInput.disabled = false;
        if (window.innerWidth > 1024) chatInput.focus();
    }
    if(ToggleMenuButton) ToggleMenuButton.disabled = false;
};

/* ==========================================================================
Creates the visual "AI is typing" animation.
========================================================================== */

const showTypingIndicator = (showAvatar = false) => {
    const typingRow = document.createElement('div');
    typingRow.classList.add('message-row', 'ai-message', 'typing-indicator-row', 'fade-out-init');
    let avatarHtml = showAvatar ? `<img src="${chatAvatarPath}" class="chat-avatar" id="active-avatar">` : '';
    typingRow.innerHTML = `
        ${avatarHtml}
        <div class="message-bubble typing-indicator">
            <span></span><span></span><span></span>
        </div>`;
    chatWindow.appendChild(typingRow);
    requestAnimationFrame(() => typingRow.classList.add('visible'));
    scrollToBottom();
    return typingRow;
};

/* ==========================================================================
Handles the smooth removal of the typing animation.
========================================================================== */

const hideTypingIndicator = (indicatorRow) => {
    return new Promise(resolve => {
        if (!indicatorRow) return resolve();
        const bubble = indicatorRow.querySelector('.typing-indicator');
        if (bubble) {
            bubble.style.opacity = "0";
            bubble.style.transition = "opacity 0.3s ease";
        }
        setTimeout(() => {
            indicatorRow.remove();
            resolve();
        }, 300);
    });
};

/* ==========================================================================
Manages the staggered reveal of contact info and social icons.
========================================================================== */

const typeContactSocials = async (container, contactData) => {
    const wrapper = document.createElement('div');
    wrapper.className = 'contact-section-wrapper';
    container.appendChild(wrapper);
    for (const item of contactData.direct) {
        const row = document.createElement('span');
        row.className = 'contact-direct-row';
        row.innerHTML = `<span><i class="${item.icon}"></i><span class="label">${item.label} </span></span> <span class="type-target"></span>`;
        wrapper.appendChild(row);
        const target = row.querySelector('.type-target');
        await typeWriterEffect(target, item.value);
        await new Promise(r => setTimeout(r, 200));
        scrollToBottom();
    }
    const socialRow = document.createElement('div');
    socialRow.className = 'contact-social-row';
    wrapper.appendChild(socialRow);
    for (const social of contactData.socials) {
        const iconLink = document.createElement('a');
        iconLink.className = 'contact-social-icon';
        iconLink.href = social.url;
        iconLink.target = '_blank';
        iconLink.innerHTML = `<i class="${social.icon} ${social.class}"></i>`;
        socialRow.appendChild(iconLink);
        await new Promise(r => setTimeout(r, 150));
        iconLink.classList.add('visible');
        scrollToBottom();
    }
    if (contactData.options) {
        const messageRow = container.closest('.message-row'); 
        renderOptions(contactData.options, messageRow, false);
        scrollToBottom();
    }
};

/* ==========================================================================
Validates user input to enable/disable the send button.
========================================================================== */

const toggleSendButtonState = () => {
    sendButton.disabled = chatInput.value.trim() === '';
};

/* ==========================================================================
The intent engine that handles keyword matching and triggers.
========================================================================== */

const processCommand = (command) => {
    const cleanedInput = command.trim().toLowerCase();
    if (cleanedInput.startsWith('__project_flow')) {
        const nextIndex = parseInt(cleanedInput.replace('__project_flow', ''));
        if (!isNaN(nextIndex)) {
            currentProjectIndex = nextIndex;
            displayNextProject();
            return '__handled'; 
        }
    }
    if (cleanedInput === '__next_project') {
        currentProjectIndex++;
        displayNextProject();
        return '__handled';
    }
    if (keywordMap[cleanedInput]) return keywordMap[cleanedInput];
    if (chatFlow[cleanedInput]) return cleanedInput;
    let bestMatchId = null;
    let minDistance = 99;
    const TYPO_THRESHOLD = 2;
    const allKeywords = Object.keys(keywordMap);
    for (const key of allKeywords) {
        const distance = levenshtein(cleanedInput, key);
        if (distance <= TYPO_THRESHOLD && distance < minDistance) {
            minDistance = distance;
            bestMatchId = keywordMap[key];
        }
        if (cleanedInput.includes(key) && key.length > 3) {
            return keywordMap[key];
        }
    }
    return bestMatchId || 'error';
};

/* ==========================================================================
The orchestrator that handles user actions and screen transitions.
========================================================================== */

const generateAndProcessResponse = async (command, displayText = command) => {
    const intro = document.getElementById('intro-screen');
    if (intro && !intro.classList.contains('fade-out')) {
        intro.classList.add('fade-out');
        setTimeout(() => intro.remove(), 600);
    }
    if (command === 'open_contact_form') {
        window.openContactModal();
        return;
    }
    if (!command.trim()) return;
    const allOptions = chatWindow.querySelectorAll('.contextual-options');
    if (allOptions.length > 0) {
        allOptions[allOptions.length - 1].remove();
    }
    const flowId = processCommand(command);
    chatInput.value = '';
    toggleSendButtonState();
    const userMessage = { speaker: 'U', text: displayText, delay: 0 };
    const userElement = createMessageElement(userMessage);
    chatWindow.appendChild(userElement);
    scrollToBottom();
    await startConversationFlow(flowId);
};

/* ==========================================================================
Builds the interactive buttons following an AI response.
========================================================================== */

const renderOptions = (options, parentElement, isInsideCard = false) => {
    if (!options || options.length === 0) return;
    const optionsContainer = document.createElement('div');
    optionsContainer.classList.add('contextual-options');
    options.forEach((option, index) => {
        const el = option.action ? document.createElement('button') : document.createElement('a');
        el.classList.add('btn', 'btn-primary');
        if (option.styleClass) { el.classList.add(option.styleClass); }
        el.innerHTML = `<span class="button-content"><span>${option.text}</span><span aria-hidden="true">${option.text}</span></span>`;
        const delay = index * 100; 
        el.style.animation = `fadeUpAndIn 0.3s ease-out forwards`;
        el.style.animationDelay = `${delay}ms`;
        if (option.action) {
            el.setAttribute('data-action', option.action);
            el.addEventListener('click', () => {
                generateAndProcessResponse(option.action, option.text);
            });
        } else if (option.link) {
            el.href = option.link;
            el.target = '_blank';
        }
        optionsContainer.appendChild(el);
    });
    if (isInsideCard) {
        parentElement.appendChild(optionsContainer);
    } else {
        if (document.body.contains(parentElement)) {
            parentElement.insertAdjacentElement('afterend', optionsContainer);
        } else {
            document.getElementById('chat-window').appendChild(optionsContainer);
        }
    }
};

/* ==========================================================================
The main external library integration for text animation.
========================================================================== */

const typeWriterEffect = (element, text) => {
    return new Promise(resolve => {
        let scrollInterval;
        const typewriter = new Typewriter(element, {
            delay: 15,
            loop: false,
            cursor: ' ', 
            autoStart: true,
            stringSplitter: (str) => {
                scrollToBottom(); 
                const regex = /(<[^>]+>|[\u{1F1E6}-\u{1F1FF}]{2}|[\p{Extended_Pictographic}]|.)/gu;
                return str.match(regex) || [];
            }
        });
        const htmlText = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        typewriter.typeString(htmlText);
        typewriter
            .callFunction(() => {
                if (scrollInterval) clearInterval(scrollInterval);
                const cursor = element.querySelector('.Typewriter__cursor');
                if (cursor) cursor.style.display = 'none';
                typewriter.stop();
                scrollToBottom(); 
                resolve();
            })
            .start();
        scrollInterval = setInterval(scrollToBottom, 50);
        setTimeout(() => {
            if (scrollInterval) clearInterval(scrollInterval);
        }, (text.length * 30) + 1000);
    });
};

/* ==========================================================================
The "factory" function that creates the HTML for all chat bubble types.
========================================================================== */

const createMessageElement = (message, showAvatar = false) => {
    const row = document.createElement('div');
    row.classList.add('message-row', message.speaker === 'A' ? 'ai-message' : 'user-message');
    if (message.speaker === 'A' && showAvatar) {
        const avatarImg = document.createElement('img');
        avatarImg.src = chatAvatarPath; 
        avatarImg.className = 'chat-avatar';
        row.appendChild(avatarImg);
    } else if (message.speaker === 'A') {
        row.classList.add('no-avatar'); 
    }
    if (message.rowClass) { row.classList.add(message.rowClass); }
    const bubble = document.createElement('div');
    bubble.classList.add('message-bubble');
    if (message.isRich && message.type === 'single-project-card') {
        bubble.classList.add('single-project-card', 'project-fade-in');
        const project = message.projectData;
        if (!project) return row;
    const card = document.createElement('div');
    card.className = 'project-card';
    const mediaWrapperClass = project.mediaType === 'image' ? 'project-media-wrapper project-image' : 'project-media-wrapper popup-content';
    let iconClass = "";
    if (project.mediaType === 'gallery') {
        iconClass = "fa-solid fa-photo-film";
    } else if (project.mediaType === 'youtube' || project.mediaType === 'video') {
        iconClass = "fa-solid fa-play";
    }
    const iconOverlay = iconClass 
        ? `<div class="media-icon-overlay"><i class="${iconClass}"></i></div>` 
        : "";
    card.innerHTML = `
        <div class="${mediaWrapperClass}">
            ${iconOverlay}
            <img src="${project.image}" alt="${project.title}">
        </div>
        <div class="details">
            <h4>${project.title}</h4>
            <p>${project.summary}</p>
            ${project.link ? `
            <a href="${project.link}" target="_blank" class="preview-link">
                ${isArabic ? 'معاينة' : 'Preview'} 
                <i class="fa-solid fa-arrow-up-right-from-square"></i>
            </a>` : ''}
        </div>
    `;
    if (card.querySelector('.popup-content')) {
        card.querySelector('.popup-content').onclick = () => openMasterModal(project);
    }
    bubble.appendChild(card);
    }
    else if (message.type === 'client-logos') {
        const introParagraph = document.createElement('div');
        introParagraph.className = 'client-intro-text';
        bubble.appendChild(introParagraph);
        typeWriterEffect(introParagraph, message.text).then(() => {
            const logoWrapper = document.createElement('div');
            logoWrapper.className = 'client-logos-wrapper';
            bubble.appendChild(logoWrapper);
            if (message.logos && message.logos.length > 0) {
                message.logos.forEach((client, i) => {
                    const logoItem = document.createElement('div');
                    logoItem.className = 'client-logo-item animated-logo';
                    logoItem.style.animationDelay = `${i * 100}ms`; 
                    logoItem.innerHTML = `<img src="${client.logoUrl}" alt="${client.name}">`;
                    logoWrapper.appendChild(logoItem);
                });
                const buttonDelay = (message.logos.length * 100) + 100;
                setTimeout(() => {
                    if (message.options) {
                        renderOptions(message.options, row, false);
                        scrollToBottom();
                    }
                }, buttonDelay);
            }
            scrollToBottom();
        });
    } 
    else if (message.speaker === 'U') {
        bubble.innerHTML = message.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    }
    row.appendChild(bubble);
    return row;
};

/* ==========================================================================
Ensures the chat always stays focused on the newest message.
========================================================================== */

const scrollToBottom = () => {
    window.scrollTo({
        top: document.documentElement.scrollHeight,
        behavior: 'smooth'
    });
};

/* ==========================================================================
The fuzzy-search algorithm used for typo protection.
========================================================================== */

function levenshtein(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) matrix[i][j] = matrix[i - 1][j - 1];
            else matrix[i][j] = Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
        }
    }
    return matrix[b.length][a.length];
}

/* ==========================================================================
Automates the creation of project navigation and cards.
========================================================================== */

const generateProjectMessage = (index, project, totalProjects, globalButtons, finalButtons) => {
    const isLast = index === totalProjects - 1;
    let buttons = [];
    if (isLast) {
        buttons = finalButtons || [];
    } else {
        buttons.push({ 
            text: 'Show Next Project', 
            action: '__project_flow' + (index + 1)
        });
        if (globalButtons) {
            buttons.push(...globalButtons);
        }
    }
    return [
        {
            speaker: 'A',
            text: `Project ${index + 1} of ${totalProjects} : **${project.title}**`,
            delay: 500
        },
        {
            speaker: 'A',
            isRich: true,
            project: { 
                type: 'single-project-card', 
                data: project
            },
            options: buttons
        }
    ];
};

/* ==========================================================================
UI Initilization & Event Listeners
========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    chatWindow = document.getElementById('chat-window');
    chatInput = document.getElementById('chat-input');
    sendButton = document.getElementById('send-button');
    const body = document.getElementById('body');
    const primaryNav = document.getElementById('primary-nav');
    const navButtonsCache = [];

    document.getElementById('intro-options-target').querySelectorAll('.btn-primary').forEach(btn => {
        const originalContent = btn.querySelector('.button-content');
        if (!originalContent) return;
        const text = originalContent.querySelector('span').innerHTML;
        btn.innerHTML = `
            <span class="button-content">
                <span>${text}</span>
                <span aria-hidden="true">${text}</span>
            </span>
        `;
    });

    // Dark/Light Mode
    const checkbox = document.getElementById("checkbox");
    checkbox.addEventListener("change", () => {
        document.body.classList.add('no-transition');
        document.body.classList.toggle("dark");
        void document.body.offsetHeight;
        document.body.classList.remove('no-transition');
    });

    // Intro Screen
    const setupIntroScreen = () => {
        const introOptions = document.getElementById('intro-options-target');
        if (!introOptions) return;
        const buttons = introOptions.querySelectorAll('button');
        buttons.forEach(btn => {
            btn.onclick = () => {
                const action = btn.getAttribute('data-action');
                const label = btn.querySelector('.button-content span').innerText;
                generateAndProcessResponse(action, label);
            };
        });
    };

    // Modal For Contact Form
    window.openContactModal = () => {
        const modal = document.getElementById('master-modal');
        const area = document.getElementById('modal-content-area');
        area.innerHTML = `
        <div class="contact-form-wrapper">
            <h3>${isArabic ? 'يسعدني تلقي رسالتك في أي وقت' : 'Feel free to drop me a message'}</h3>
            <form class="ajax-contact-form" id="ajax-contact-form">
                <input autocomplete="off" type="text" name="user_name" 
                    placeholder="${isArabic ? 'الاسم' : 'Name'}" required>
                <input autocomplete="off" type="email" name="user_email" id="form_email" 
                    placeholder="${isArabic ? 'البريد الإلكتروني' : 'Email'}" required> 
                <textarea name="user_message" 
                    placeholder="${isArabic ? 'رسالتك...' : 'Message'}" required></textarea>
                <button type="submit" id="form-submit-btn" class="btn btn-primary">
                    <span class="button-content">
                        <span>${isArabic ? 'إرسال الرسالة' : 'Send Message'}</span>
                        <span aria-hidden="true">${isArabic ? 'إرسال الرسالة' : 'Send Message'}</span>
                    </span>
                </button>
            </form>
        </div>
        `;
        modal.classList.add('active', 'modal-contact');
        const form = document.getElementById('ajax-contact-form');
        form.onsubmit = async function(e) {
            e.preventDefault();
            const btn = document.getElementById('form-submit-btn');
            const nameVal = this.querySelector('[name="user_name"]').value;
            const emailVal = this.querySelector('[name="user_email"]').value;
            const messageVal = this.querySelector('[name="user_message"]').value;
            btn.disabled = true;
            btn.innerText = isArabic ? "جاري الإرسال..." : "Sending...";
            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_name: nameVal,
                        user_email: emailVal,
                        user_message: messageVal
                    })
                });
                const result = await response.json();
                if (result.status === 'success') {
                    closeMasterModal();
                    setTimeout(() => {
                        startConversationFlow('msg_success');
                    }, 500);
                } else {
                    throw new Error(result.message);
                }
            } catch (error) {
                console.error('Submission Error:', error);
                btn.innerText = isArabic ? "خطأ - حاول مرة أخرى" : "Error - Try Again";
                btn.disabled = false;
            }
        };
    };

    // Modal For Projects Section
    window.openMasterModal = (project) => {
        const modal = document.getElementById('master-modal');
        const area = document.getElementById('modal-content-area');
        window.currentSlideIndex = 0;
        area.innerHTML = '';
        if (project.mediaType === 'gallery') {
            let slides = project.gallery.map(img => `<div class="slider-item"><img alt="" src="${img}" class="slider-img"></div>`).join('');
            area.innerHTML = `
                <div class="modal-slider">
                    <div id="modal-counter" class="modal-counter"></div> 
                    <button class="slider-nav prev-slide" onclick="moveSlide(-1)"><i class="fa-solid fa-chevron-left"></i></button>
                    <div class="slider-track" id="s-track">${slides}</div>
                    <button class="slider-nav next-slide" onclick="moveSlide(1)"><i class="fa-solid fa-chevron-right"></i></button>
                </div>`;
                updateCounter(project.gallery.length);
                updateNavButtons(project.gallery.length);
        } else if (project.mediaType === 'video') {
            area.innerHTML = `<video src="${project.videoUrl}" controls autoplay style="width:100%"></video>`;
        } else if (project.mediaType === 'youtube') {
            area.innerHTML = `
                <iframe width="100%" height="100%" 
                    src="https://www.youtube-nocookie.com/embed/${project.youtubeId}?autoplay=1&rel=0&enablejsapi=1" 
                    frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>`;
        }
        modal.classList.add('active');
    };

    // Gallery Navigation
    window.currentSlideIndex = 0;
    window.moveSlide = (step) => {
        const track = document.getElementById('s-track');
        if (!track) return;
        const slides = track.querySelectorAll('.slider-item');
        const totalSlides = slides.length;
        if (totalSlides === 0) return;
        let newIndex = window.currentSlideIndex + step;
        if (newIndex < 0) newIndex = 0;
        else if (newIndex >= totalSlides) newIndex = totalSlides - 1;
        window.currentSlideIndex = newIndex;
        const percentage = window.currentSlideIndex * 100;
        if (isArabic) {
            track.style.transform = `translateX(${percentage}%)`;
        } else {
            track.style.transform = `translateX(-${percentage}%)`;
        }
        updateNavButtons(totalSlides);
        updateCounter(totalSlides);
    };

    // Gallery Navigation with Keyboard Left and Right Arrows
    document.addEventListener('keydown', function (e) {
        if (e.key === "Escape") {
            const modal = document.getElementById('master-modal');
            if (modal.classList.contains('active')) closeMasterModal();
        }
        if (document.querySelector('.modal-slider')) {
            if (e.key === 'ArrowLeft') {
                window.moveSlide(-1);
            } else if (e.key === 'ArrowRight') {
                window.moveSlide(1);
            }
        }
    });

    // Visibility of Slider Navigation Arrows
    function updateNavButtons(total) {
        const prevBtn = document.querySelector('.prev-slide');
        const nextBtn = document.querySelector('.next-slide');
        if (!prevBtn || !nextBtn) return;
        if (isArabic) {
            prevBtn.style.display = (window.currentSlideIndex === 0) ? 'none' : 'flex';
            nextBtn.style.display = (window.currentSlideIndex === total - 1) ? 'none' : 'flex';
        } else {
            prevBtn.style.display = (window.currentSlideIndex === 0) ? 'none' : 'flex';
            nextBtn.style.display = (window.currentSlideIndex === total - 1) ? 'none' : 'flex';
        }
    }

    // Touch Swipe Support for Gallry Navigation
    let touchstartX = 0;
    let touchendX = 0;
    const modalContainer = document.querySelector('.modal-container');
    modalContainer.addEventListener('touchstart', e => {
        touchstartX = e.changedTouches[0].screenX;
    }, { passive: true });
    modalContainer.addEventListener('touchend', e => {
        touchendX = e.changedTouches[0].screenX;
        handleGesture();
    }, { passive: true });
    function handleGesture() {
        const track = document.getElementById('s-track');
        if (!track) return;
        const swipeThreshold = 50;
        if (touchendX < touchstartX - swipeThreshold) {
            isArabic ? window.moveSlide(-1) : window.moveSlide(1);
        }
        if (touchendX > touchstartX + swipeThreshold) {
            isArabic ? window.moveSlide(1) : window.moveSlide(-1);
        }
    }
    let isDragging = false;
    let startPos = 0;
    const sliderContainer = document.querySelector('.modal-container');
    sliderContainer.addEventListener('mousedown', (e) => {
        if (!document.getElementById('s-track')) return;
        isDragging = true;
        startPos = e.pageX;
        sliderContainer.style.cursor = 'grabbing';
    });
    const endDrag = (e) => {
        if (!isDragging) return;
        const endPos = e.pageX;
        const diff = endPos - startPos;
        const threshold = 70;
        if (diff < -threshold) {
            isArabic ? window.moveSlide(-1) : window.moveSlide(1);
        }
        if (diff > threshold) {
            isArabic ? window.moveSlide(1) : window.moveSlide(-1);
        }
        
        isDragging = false;
        sliderContainer.style.cursor = 'grab';
    };
    sliderContainer.addEventListener('mouseup', endDrag);
    sliderContainer.addEventListener('mouseleave', endDrag);

    // Counter in the Gallery View
    function updateCounter(total) {
        const counter = document.getElementById('modal-counter');
        if (!counter) return;
        counter.textContent = `${window.currentSlideIndex + 1} / ${total}`;
    }

    // Modal Closing
    window.closeMasterModal = () => {
        const modal = document.getElementById('master-modal');
        const area = document.getElementById('modal-content-area');
        modal.classList.remove('active');
        setTimeout(() => {
            area.innerHTML = '';
        }, 300);
    };
    document.getElementById('master-modal').addEventListener('click', function (e) {
        if (e.target === this) closeMasterModal();
    });

    // Footer Menu
    const NavigationMenu = () => {
        const menuToggle = document.getElementById('btn-menu-toggle');
        const linksContainer = primaryNav.querySelector('.nav-links-container');
        const buttons = linksContainer.querySelectorAll('.btn-primary-nav');
        buttons.forEach(button => {
            button.addEventListener('click', (e) => {
                const flowId = button.getAttribute('data-flow');
                const label = button.innerText.trim();
                generateAndProcessResponse(label); 
                primaryNav.classList.remove('menu-active');
                document.body.classList.remove('open-menu');
            });
            navButtonsCache.push(button);
        });
        if (menuToggle) {
            menuToggle.onclick = (e) => {
                document.body.classList.toggle('open-menu');
                e.stopPropagation();
                primaryNav.classList.toggle('menu-active');
            };
        }
        document.addEventListener('click', (event) => {
            const isClickInsideMenu = primaryNav.contains(event.target);
            const isClickOnToggle = menuToggle && menuToggle.contains(event.target);
            if (primaryNav.classList.contains('menu-active') && !isClickInsideMenu && !isClickOnToggle) {
                primaryNav.classList.remove('menu-active');
                document.body.classList.remove('open-menu');
            } 
        });
    };
    
    // Menu And Intro Screen Initializations
    NavigationMenu();
    setupIntroScreen();

    // Event Listeners for User Input and the Send Button
    chatInput.addEventListener('input', toggleSendButtonState);
    sendButton.addEventListener('click', () => {
        if (!sendButton.disabled) generateAndProcessResponse(chatInput.value);
    });
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (chatInput.value.trim() !== '') generateAndProcessResponse(chatInput.value);
        }
    });
    toggleSendButtonState();
});

/* ==========================================================================
Page Initialization and Entrance Animations
========================================================================== */

window.addEventListener('load', () => {

    // 1. Initialize the chatbot logic and data flows
    initializeFlows(); 

    // 2. Preloader Animation
    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(() => {
            preloader.classList.add('preloaded');
        }, 800);
    }

});