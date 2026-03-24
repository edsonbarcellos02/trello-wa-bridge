function formatDateTime() {
    return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function injectWhatsAppButton() {
    // Se o botão já existe, não faz nada
    if (document.getElementById('trello-wa-container')) return;

    // Procuramos todas as seções do card
    const sections = document.querySelectorAll('section');
    
    let anchorSection = null;

    // Busca âncora estável por texto (Etiquetas ou Membros)
    for (const section of sections) {
        const h3 = section.querySelector('h3');
        if (h3 && (h3.innerText.includes('Etiquetas') || h3.innerText.includes('Membros'))) {
            anchorSection = section;
            break;
        }
    }

    if (anchorSection) {
        const container = document.createElement('section');
        container.id = 'trello-wa-container';
        container.className = anchorSection.className; 
        
        container.innerHTML = `
            <h3 class="umZktd0zr7EQ11" style="color: #25d366;">WhatsApp Status</h3>
            <div style="display: flex; flex-direction: column; gap: 6px; margin-top: 8px;">
                <div style="display: flex; gap: 8px;">
                    <button id="wa-btn-start" style="flex: 1; background: #1976d2; color: white; border: none; padding: 6px; border-radius: 3px; cursor: pointer; height: 32px; font-weight: bold;">Iniciar</button>
                    <button id="wa-btn-test" style="flex: 1; background: #ff9800; color: white; border: none; padding: 6px; border-radius: 3px; cursor: pointer; height: 32px; font-weight: bold;">Teste</button>
                    <button id="wa-btn-end" style="flex: 1; background: #259550; color: white; border: none; padding: 6px; border-radius: 3px; cursor: pointer; height: 32px; font-weight: bold;">Entregar</button>
                </div>
            </div>
        `;

        anchorSection.parentNode.insertBefore(container, anchorSection.nextSibling);

        document.getElementById('wa-btn-start').onclick = () => sendStatus('START');
        document.getElementById('wa-btn-end').onclick = () => sendStatus('DONE');
        document.getElementById('wa-btn-test').onclick = () => sendStatus('TEST');
    }
}

function sendStatus(mode) {
    const titleEl = document.querySelector('[data-testid="card-back-title-input"]');
    const cardName = titleEl ? titleEl.value : "Tarefa";

    // Busca o Card Number dinamicamente
    let ticketNumber = "Sem ID";
    const sections = document.querySelectorAll('section');
    for (const section of sections) {
        const h3 = section.querySelector('h3');
        if (h3 && h3.innerText.includes('Card Number')) {
            const btn = section.querySelector('button');
            if (btn) ticketNumber = btn.innerText.trim();
            break;
        }
    }

    const cardUrl = window.location.href;
    const horaAtual = formatDateTime();
    
    let status = "";
    if (mode === 'DONE') status = '*[CONCLUÍDO]*';
    else if (mode === 'TEST') status = '*[TESTE]*';
    else status = '*[INICIANDO]*';
    
    const message = `${status}\n━━━━━━━━━━━━━━━\n*Hora:* ${horaAtual}\n*Tarefa:* ${cardName}\n*ID:* ${ticketNumber}\n*Link:* ${cardUrl}`;
    const encodedMsg = encodeURIComponent(message);

    // Primeiro tenta o protocolo direto (melhor para Brave/Edge)
    // Se o Chrome bloquear, o window.open logo abaixo resolve
    const appUrl = `whatsapp://send?text=${encodedMsg}`;
    const apiUrl = `https://api.whatsapp.com/send?text=${encodedMsg}`;

    if (mode === 'TEST') {
        console.log("=== DEBUG TRELLO-WA ===");
        console.log("Título:", cardName);
        console.log("ID:", ticketNumber);
        console.log("URL:", cardUrl);
    }

    // Tenta forçar a abertura do App e depois abre a aba de fallback para o Chrome
    window.location.href = appUrl;
    
    setTimeout(() => {
        if (document.hasFocus()) {
            window.open(apiUrl, '_blank');
        }
    }, 500);
}

// Observador para garantir que o botão apareça mesmo em navegação rápida
setInterval(injectWhatsAppButton, 1000);