function formatDateTime() {
    return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function injectWhatsAppButton() {
    if (document.getElementById('trello-wa-container')) return;

    const sections = document.querySelectorAll('section');
    let anchorSection = null;

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
            <div style="display: flex; gap: 8px; margin-top: 8px;">
                <select id="wa-select" style="flex: 1; padding: 6px; border-radius: 3px; border: 1px solid #ccc; height: 32px; cursor: pointer;">
                    <option value="START">🔵 Iniciar</option>
                    <option value="RESUME">🟣 Retomar</option>
                    <option value="BLOCKED">🔴 Bloqueado</option>
                    <option value="DONE">🟢 Entregar</option>
                    <option value="TEST">🟠 Teste</option>
                </select>
                <button id="wa-btn-send" style="background: #25d366; color: white; border: none; padding: 6px 12px; border-radius: 3px; cursor: pointer; height: 32px; font-weight: bold;">Enviar</button>
            </div>
        `;

        anchorSection.parentNode.insertBefore(container, anchorSection.nextSibling);

        document.getElementById('wa-btn-send').onclick = () => {
            const mode = document.getElementById('wa-select').value;
            const btn = document.getElementById('wa-btn-send');
            sendStatus(mode);
            btn.textContent = '✅ Enviado!';
            btn.disabled = true;
            setTimeout(() => { btn.textContent = 'Enviar'; btn.disabled = false; }, 2000);
        };
    }
}

function sendStatus(mode) {
    const titleEl = document.querySelector('[data-testid="card-back-title-input"]');
    const cardName = titleEl ? titleEl.value : "Tarefa";

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
    else if (mode === 'RESUME') status = '*[RETOMANDO]*';
    else if (mode === 'BLOCKED') status = '*[BLOQUEADO]*';
    else if (mode === 'TEST') status = '*[TESTE]*';
    else status = '*[INICIANDO]*';

    const message = `${status}\n━━━━━━━━━━━━━━━\n*Hora:* ${horaAtual}\n*Tarefa:* ${cardName}\n*ID:* ${ticketNumber}\n*Link:* ${cardUrl}`;
    const encodedMsg = encodeURIComponent(message);

    const appUrl = `whatsapp://send?text=${encodedMsg}`;
    const apiUrl = `https://api.whatsapp.com/send?text=${encodedMsg}`;

    if (mode === 'TEST') {
        console.log("=== DEBUG TRELLO-WA ===");
        console.log("Título:", cardName);
        console.log("ID:", ticketNumber);
        console.log("URL:", cardUrl);
    }

    window.location.href = appUrl;

    setTimeout(() => {
        if (document.hasFocus()) {
            window.open(apiUrl, '_blank');
        }
    }, 500);
}

setInterval(injectWhatsAppButton, 1000);
