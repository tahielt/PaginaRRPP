/**
 * SOFI ZENON - TUS TICKETS
 * Script para cargar eventos desde Airtable
 * 
 * VENTAJA: Sofi puede subir fotos directo desde el celu sin copiar links!
 */

// ============================================
// CONFIGURACIÓN DE AIRTABLE
// ============================================
// Instrucciones:
// 1. Crear cuenta en airtable.com
// 2. Crear base con columnas: fecha, evento, imagen, link
// 3. Ir a airtable.com/create/tokens y crear un token
// 4. Copiar el Base ID y Token abajo

const AIRTABLE_CONFIG = {
    baseId: 'appTqhPIjPhb86JdF',
    tableName: 'Eventos',
    apiKey: 'pat5pfTWmDi3EE6iB.e438715f45980fb1492b08f1aecba6f7e333bb6ce22691966ded401cbff78c89'
};

// ============================================
// DATOS DE EJEMPLO (se usan si no hay Airtable)
// ============================================
const DEMO_EVENTS = [
    {
        fecha: '24/01',
        evento: 'CADELAGO 🔥🔥',
        imagen: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=400&fit=crop',
        link: 'https://venti.com.ar'
    },
    {
        fecha: '25/01',
        evento: 'TLW - The Last Weekend 🎉',
        imagen: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=400&fit=crop',
        link: 'https://venti.com.ar'
    },
    {
        fecha: '31/01',
        evento: 'AFTER OFICIAL MELLINO 🪩',
        imagen: 'https://images.unsplash.com/photo-1571266028243-e4733b0f0bb0?w=400&h=400&fit=crop',
        link: 'https://venti.com.ar'
    },
    {
        fecha: '01/02',
        evento: 'DHARMA EN LOWTHER 🔥🔥',
        imagen: 'https://images.unsplash.com/photo-1574391884720-bbc3740c59d1?w=400&h=400&fit=crop',
        link: 'https://venti.com.ar'
    }
];

// ============================================
// ELEMENTOS DEL DOM
// ============================================
const loadingEl = document.getElementById('loading');
const eventsContainer = document.getElementById('events-container');
const emptyState = document.getElementById('empty-state');

// Modal elements
const modalOverlay = document.getElementById('modal-overlay');
const modalClose = document.getElementById('modal-close');
const modalImage = document.getElementById('modal-image');
const modalTitle = document.getElementById('modal-title');
const modalDate = document.getElementById('modal-date');
const modalButton = document.getElementById('modal-button');

// ============================================
// FUNCIONES DE AIRTABLE
// ============================================

/**
 * Carga eventos desde Airtable
 */
async function fetchFromAirtable() {
    const { baseId, tableName, apiKey } = AIRTABLE_CONFIG;

    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`;

    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${apiKey}`
        }
    });

    if (!response.ok) {
        throw new Error('Error al cargar desde Airtable');
    }

    const data = await response.json();

    // Convertir formato Airtable a nuestro formato
    return data.records.map(record => {
        const fields = record.fields;
        // Airtable guarda imágenes como array de attachments
        const imagenUrl = fields.imagen && fields.imagen[0]
            ? fields.imagen[0].url
            : '';

        return {
            fecha: fields.fecha || '',
            evento: fields.evento || '',
            imagen: imagenUrl,
            link: fields.link || ''
        };
    }).filter(e => e.evento && e.link);
}

// ============================================
// FUNCIONES DE UI
// ============================================

/**
 * Abre el modal con los datos del evento
 */
function openModal(event) {
    modalImage.src = event.imagen || 'https://via.placeholder.com/400x400/1a1a1a/666?text=🎫';
    modalImage.alt = event.evento;
    modalTitle.textContent = event.evento;
    modalDate.textContent = event.fecha;
    modalButton.href = event.link;

    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

/**
 * Cierra el modal
 */
function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
}

/**
 * Crea el HTML de una card de evento
 */
function createEventCard(event) {
    const card = document.createElement('div');
    card.className = 'event-card';
    card.style.cursor = 'pointer';

    card.innerHTML = `
        <img 
            class="event-image" 
            src="${event.imagen || 'https://via.placeholder.com/80x80/1a1a1a/666?text=🎫'}" 
            alt="${event.evento}"
            onerror="this.src='https://via.placeholder.com/80x80/1a1a1a/666?text=🎫'"
        >
        <div class="event-info">
            <div class="event-date">${event.fecha}</div>
            <div class="event-name">${event.evento}</div>
            <div class="event-cta">TICKETS ⬇️</div>
        </div>
        <div class="event-arrow">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 18l6-6-6-6"/>
            </svg>
        </div>
    `;

    card.addEventListener('click', () => openModal(event));

    return card;
}

/**
 * Renderiza los eventos en la página
 */
function renderEvents(events) {
    loadingEl.classList.add('hidden');
    eventsContainer.innerHTML = '';

    if (events.length === 0) {
        emptyState.style.display = 'block';
        return;
    }

    events.forEach(event => {
        const card = createEventCard(event);
        eventsContainer.appendChild(card);
    });
}

/**
 * Carga eventos
 */
async function loadEvents() {
    const { baseId, apiKey } = AIRTABLE_CONFIG;

    // Si no hay config de Airtable, usar datos demo
    if (!baseId || !apiKey) {
        console.log('📋 Airtable no configurado, usando datos de demostración');
        setTimeout(() => renderEvents(DEMO_EVENTS), 500);
        return;
    }

    try {
        const events = await fetchFromAirtable();
        renderEvents(events);
        console.log('✅ Eventos cargados desde Airtable');

    } catch (error) {
        console.error('Error cargando desde Airtable:', error);
        console.log('📋 Cargando datos de demostración...');
        renderEvents(DEMO_EVENTS);
    }
}

// ============================================
// EVENT LISTENERS
// ============================================

modalClose.addEventListener('click', closeModal);

modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        closeModal();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
        closeModal();
    }
});

// ============================================
// INICIALIZACIÓN
// ============================================
document.addEventListener('DOMContentLoaded', loadEvents);
