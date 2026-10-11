/**
 * app.js
 * Logika utama aplikasi: Client-Side Rendering (CSR), modal universal,
 * filter kategori, dan pengiriman formulir asinkron.
 * Mahasiswa: Nikah Suchia Panjaitan (12S24041)
 */

class PortfolioApp {
    state = {
        projects: [],
        services: [],
        profile: null,
        activeFilter: 'all',
        orders: []
    };

    STORAGE_KEY = 'ppw_portfolio_service_orders_v4';

    constructor() {
        this.init();
    }

    // Inisialisasi aplikasi saat pertama kali dimuat
    async init() {
        this.loadOrdersFromStorage();
        this.updateOrderBadgeUI();
        this.setupFormListener();
        this.setupFilterListeners();
        this.setupStorageListener();

        // Ambil data dari file JSON
        await this.loadInitialData();
    }

    // Sanitasi teks string agar aman dari serangan XSS sebelum dimasukkan ke HTML
    escapeHTML(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Pengecekan URL sederhana agar tidak ada skema berbahaya seperti javascript:
    sanitizeURL(url) {
        if (!url || typeof url !== 'string') return '#';
        const trimmed = url.trim();

        // Tolak skema berbahaya
        if (/^(javascript|data|vbscript):/i.test(trimmed)) {
            console.warn('URL tidak aman dicegah:', trimmed);
            return '#';
        }

        // Izinkan URL HTTPS atau path lokal
        if (/^https:\/\//i.test(trimmed) || /^(\.{0,2}\/)?assets\//i.test(trimmed) || trimmed.startsWith('#')) {
            return this.escapeHTML(trimmed);
        }

        return '#';
    }

    // Mengambil data awal dari api-service
    async loadInitialData() {
        const container = document.getElementById('portfolioContainer');
        this.renderLoadingState(container);

        try {
            // Ambil data proyek, layanan, dan profil sekaligus
            const [projectsData, servicesData, profileData] = await Promise.all([
                ApiService.getProjects(),
                ApiService.getServices(),
                ApiService.getProfile()
            ]);

            this.state.projects = Array.isArray(projectsData) ? projectsData : [];
            this.state.services = Array.isArray(servicesData) ? servicesData : [];
            this.state.profile = profileData || null;

            // Tampilkan kartu proyek ke layar
            this.renderFilteredProjects();

            // Isi pilihan dropdown formulir layanan
            this.populateServiceDropdown();

        } catch (error) {
            console.error('Gagal mengambil data:', error);
            this.renderErrorState(container, error.message || 'Gagal memuat data dari file JSON.');
        }
    }

    /* -------------------------------------------------------------------------
     * 4 UI STATES (LOADING, SUCCESS, EMPTY, ERROR)
     * ------------------------------------------------------------------------- */

    // 1. Loading State (Tampilkan spinner & skeleton)
    renderLoadingState(container) {
        if (!container) return;
        container.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="spinner-border text-primary mb-3" role="status">
                    <span class="visually-hidden">Memuat data...</span>
                </div>
                <h5 class="fw-bold">Memuat Data Proyek...</h5>
                <p class="text-muted small mb-4">Mengambil data dari file JSON secara asinkron.</p>

                <!-- Placeholder skeleton -->
                <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 text-start">
                    ${[1, 2, 3].map(() => `
                        <div class="col">
                            <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
                                <div class="placeholder-glow" style="height: 180px; background-color: #e9ecef;">
                                    <span class="placeholder col-12 h-100"></span>
                                </div>
                                <div class="card-body p-4">
                                    <span class="placeholder col-4 mb-2"></span>
                                    <h5 class="card-title placeholder-glow"><span class="placeholder col-8"></span></h5>
                                    <p class="card-text placeholder-glow">
                                        <span class="placeholder col-12"></span>
                                        <span class="placeholder col-10"></span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // 2. Success State (Render kartu proyek)
    renderSuccessState(container, projects) {
        if (!container) return;

        container.innerHTML = projects.map((proj, index) => {
            const safeTitle = this.escapeHTML(proj.title || 'Proyek');
            const safeCategory = this.escapeHTML(proj.category || 'Akademik');
            const safeSubtitle = this.escapeHTML(proj.subtitle || '');
            const safeShortDesc = this.escapeHTML(proj.shortDescription || '');
            const safeThumbnail = this.sanitizeURL(proj.thumbnail);
            const safeBadgeType = this.escapeHTML(proj.badgeType || 'Dokumentasi');
            const safeBadgeIcon = this.escapeHTML(proj.badgeIcon || 'bi-patch-check-fill');

            const tagsHTML = (proj.tags || []).map(t => 
                `<span class="badge">${this.escapeHTML(t)}</span>`
            ).join(' ');

            const downloadButtonHTML = (proj.downloadLink && proj.downloadLink.url) ? `
                <a
                    href="${this.sanitizeURL(proj.downloadLink.url)}"
                    class="btn btn-outline-secondary btn-sm"
                    download
                    title="Unduh berkas ${safeTitle}"
                >
                    <i class="bi ${this.escapeHTML(proj.downloadLink.icon || 'bi-download')} me-1"></i>
                    ${this.escapeHTML(proj.downloadLink.type ? proj.downloadLink.type.toUpperCase() : 'BERKAS')} ↗
                </a>
            ` : '';

            return `
                <div class="col">
                    <article class="card h-100 project-card documented-project-card shadow-sm border-0">
                        <!-- Cover Gambar -->
                        <div class="project-thumb-wrapper">
                            <img
                                src="${safeThumbnail}"
                                alt="${safeTitle}"
                                class="project-thumb-img"
                                loading="lazy"
                            >
                            <div class="project-thumb-overlay">
                                <span class="badge project-badge-num">PROYEK 0${index + 1}</span>
                                <span class="badge bg-success-subtle text-success border border-success-subtle">
                                    <i class="bi ${safeBadgeIcon} me-1"></i>${safeBadgeType}
                                </span>
                            </div>
                        </div>

                        <!-- Isi Kartu -->
                        <div class="card-body d-flex flex-column project-content p-4">
                            <div class="d-flex align-items-center justify-content-between mb-1">
                                <span class="project-category">${safeCategory}</span>
                                <small class="text-muted fw-semibold">Proyek 0${index + 1}</small>
                            </div>

                            <h3 class="card-title fw-bold fs-5 text-dark mb-1">${safeTitle}</h3>
                            <p class="small text-muted fw-semibold mb-2">${safeSubtitle}</p>
                            <p class="card-text text-secondary small mb-3">${safeShortDesc}</p>

                            <div class="project-tags mb-3">${tagsHTML}</div>

                            <div class="mt-auto d-flex flex-wrap gap-2 pt-2 border-top">
                                <button
                                    type="button"
                                    class="btn btn-primary btn-sm project-btn px-3"
                                    onclick="window.portfolioApp.openProjectModal('${this.escapeHTML(proj.id)}')"
                                >
                                    <i class="bi bi-journal-text me-1"></i> Buka Case Study
                                </button>
                                ${downloadButtonHTML}
                            </div>
                        </div>
                    </article>
                </div>
            `;
        }).join('');
    }

    // 3. Empty State (Saat filter tidak menemukan data)
    renderEmptyState(container) {
        if (!container) return;
        container.innerHTML = `
            <div class="col-12 py-5 text-center">
                <div class="card border-dashed p-4 bg-light rounded-4 mx-auto" style="max-width: 500px;">
                    <div class="display-6 text-muted mb-2"><i class="bi bi-folder-x"></i></div>
                    <h5 class="fw-bold">Tidak Ada Proyek Ditemukan</h5>
                    <p class="text-muted small mb-3">Tidak ada proyek untuk kategori "<strong>${this.escapeHTML(this.state.activeFilter)}</strong>".</p>
                    <div>
                        <button class="btn btn-primary btn-sm" onclick="window.portfolioApp.setFilter('all')">
                            <i class="bi bi-arrow-counterclockwise me-1"></i> Tampilkan Semua
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // 4. Error State (Jika pemanggilan fetch gagal)
    renderErrorState(container, errorMessage) {
        if (!container) return;
        container.innerHTML = `
            <div class="col-12 py-5 text-center">
                <div class="alert alert-danger p-4 rounded-4 shadow-sm mx-auto" style="max-width: 500px;" role="alert">
                    <h5 class="alert-heading fw-bold mb-2"><i class="bi bi-exclamation-triangle me-2"></i>Gagal Memuat Data</h5>
                    <p class="small text-muted mb-3">${this.escapeHTML(errorMessage)}</p>
                    <button class="btn btn-danger btn-sm" onclick="window.portfolioApp.loadInitialData()">
                        <i class="bi bi-arrow-repeat me-1"></i> Coba Lagi
                    </button>
                </div>
            </div>
        `;
    }

    /* -------------------------------------------------------------------------
     * FILTER KATEGORI PROYEK
     * ------------------------------------------------------------------------- */

    renderFilteredProjects() {
        const container = document.getElementById('portfolioContainer');
        if (!container) return;

        let filtered = this.state.projects;
        if (this.state.activeFilter !== 'all') {
            filtered = this.state.projects.filter(p => p.categoryKey === this.state.activeFilter);
        }

        if (filtered.length === 0) {
            this.renderEmptyState(container);
        } else {
            this.renderSuccessState(container, filtered);
        }

        const countBadge = document.getElementById('portfolioCountBadge');
        if (countBadge) {
            countBadge.textContent = `${String(filtered.length).padStart(2, '0')} Projects`;
        }
    }

    setFilter(filterKey) {
        this.state.activeFilter = filterKey;

        // Ubah tombol aktif
        const filterButtons = document.querySelectorAll('[data-filter]');
        filterButtons.forEach(btn => {
            if (btn.getAttribute('data-filter') === filterKey) {
                btn.classList.add('active', 'btn-primary');
                btn.classList.remove('btn-outline-primary');
            } else {
                btn.classList.remove('active', 'btn-primary');
                btn.classList.add('btn-outline-primary');
            }
        });

        this.renderFilteredProjects();
    }

    setupFilterListeners() {
        const filterContainer = document.getElementById('portfolioFilterContainer');
        if (!filterContainer) return;

        filterContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-filter]');
            if (!btn) return;
            this.setFilter(btn.getAttribute('data-filter'));
        });
    }

    /* -------------------------------------------------------------------------
     * UNIVERSAL DYNAMIC MODAL (1 MODAL TUNGGAL UNTUK SEMUA PROYEK)
     * ------------------------------------------------------------------------- */

    openProjectModal(projectId) {
        const project = this.state.projects.find(p => p.id === projectId);
        if (!project) return;

        const modalEl = document.getElementById('universalProjectModal');
        const modalTitle = document.getElementById('projectModalTitle');
        const modalBody = document.getElementById('projectModalBody');

        if (!modalEl || !modalTitle || !modalBody) return;

        modalTitle.textContent = project.title || 'Detail Proyek';

        // Render data angka metrik
        const metricsHTML = (project.metrics || []).map(m => `
            <div class="col-6 col-md-3">
                <div class="p-3 bg-light border rounded-3 text-center h-100">
                    <span class="d-block text-muted smaller text-uppercase fw-bold">${this.escapeHTML(m.label || '-')}</span>
                    <strong class="fs-4 text-primary d-block my-1">${this.escapeHTML(m.value || '-')}</strong>
                    <span class="badge bg-secondary-subtle text-secondary smaller">${this.escapeHTML(m.context || '')}</span>
                </div>
            </div>
        `).join('');

        // Render galeri gambar artefak
        const artifactsHTML = (project.artifacts || []).map(art => `
            <div class="col-12 col-md-6">
                <div class="card h-100 border shadow-sm rounded-3 overflow-hidden">
                    <img src="${this.sanitizeURL(art.image)}" alt="${this.escapeHTML(art.title || '')}" class="card-img-top" loading="lazy">
                    <div class="card-body p-3">
                        <h6 class="fw-bold mb-1">${this.escapeHTML(art.title || '')}</h6>
                        <p class="small text-muted mb-0">${this.escapeHTML(art.caption || '')}</p>
                    </div>
                </div>
            </div>
        `).join('');

        // Render tags
        const tagsHTML = (project.tags || []).map(t => `
            <span class="badge bg-primary-subtle text-primary border border-primary-subtle">${this.escapeHTML(t)}</span>
        `).join(' ');

        // Tombol download
        const downloadActionHTML = (project.downloadLink && project.downloadLink.url) ? `
            <a href="${this.sanitizeURL(project.downloadLink.url)}" class="btn btn-primary" download>
                <i class="bi ${this.escapeHTML(project.downloadLink.icon || 'bi-download')} me-1"></i>
                ${this.escapeHTML(project.downloadLink.label || 'Unduh Berkas')}
            </a>
        ` : '';

        // Masukkan konten ke dalam modal body
        modalBody.innerHTML = `
            <!-- Preview Cover -->
            <div class="mb-4 rounded-3 overflow-hidden border">
                <img src="${this.sanitizeURL(project.thumbnail)}" alt="${this.escapeHTML(project.title || '')}" class="img-fluid w-100" style="max-height: 380px; object-fit: cover;">
            </div>

            <!-- Kategori & Subtitle -->
            <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                <span class="badge bg-primary px-3 py-2 fs-6">${this.escapeHTML(project.category || 'Akademik')}</span>
                <span class="text-muted fw-semibold small">${this.escapeHTML(project.subtitle || '')}</span>
            </div>

            <!-- Ringkasan Angka Metrik -->
            <div class="row g-2 mb-4">${metricsHTML}</div>

            <!-- Deskripsi Lengkap -->
            <div class="mb-4">
                <h6 class="fw-bold text-dark border-bottom pb-2">Deskripsi Lengkap</h6>
                <p class="text-secondary" style="line-height: 1.8;">${this.escapeHTML(project.fullDescription || '')}</p>
            </div>

            <!-- Galeri Artefak Gambar -->
            <div class="mb-4">
                <h6 class="fw-bold text-dark border-bottom pb-2">Galeri Artefak Dokumen & Diagram</h6>
                <div class="row g-3 mt-1">${artifactsHTML}</div>
            </div>

            <!-- Tags -->
            <div class="mb-4">
                <h6 class="fw-bold text-dark border-bottom pb-2">Keahlian & Perangkat yang Digunakan</h6>
                <div class="d-flex flex-wrap gap-2 mt-2">${tagsHTML}</div>
            </div>

            <!-- Tombol Aksi Bawah -->
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 pt-3 border-top">
                <div>${downloadActionHTML}</div>
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Tutup</button>
            </div>
        `;

        // Tampilkan modal lewat Bootstrap API
        bootstrap.Modal.getOrCreateInstance(modalEl).show();
    }

    /* -------------------------------------------------------------------------
     * FORMULIR LAYANAN & NOTIFIKASI TOAST
     * ------------------------------------------------------------------------- */

    setupFormListener() {
        const form = document.querySelector('.contact-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault(); // Jangan reload halaman

            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnHTML = submitBtn ? submitBtn.innerHTML : 'Kirim Permintaan';

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Mengirim...';
            }

            const formData = new FormData(form);
            const payload = Object.fromEntries(formData.entries());

            try {
                // Kirim form via POST ke API
                const response = await ApiService.submitServiceOrder(payload);

                // Simpan ke localStorage
                this.saveOrderToLocalStorage(response.data);

                // Tampilkan notifikasi toast
                this.showToastNotification(
                    'Pemesanan Berhasil!',
                    `Halo <strong>${this.escapeHTML(payload.nama)}</strong>, permintaan konsultasi untuk <em>"${this.escapeHTML(payload.layanan)}"</em> berhasil dikirim.`
                );

                form.reset();

            } catch (err) {
                console.error('Error saat submit form:', err);
                this.showToastNotification('Gagal Mengirim Form', err.message || 'Terjadi kesalahan.', 'danger');
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnHTML;
                }
            }
        });
    }

    saveOrderToLocalStorage(orderData) {
        try {
            const newOrder = {
                id: `ORD-${Date.now()}`,
                ...orderData,
                createdAt: new Date().toISOString()
            };

            this.state.orders.unshift(newOrder);

            // Batasi 10 riwayat terakhir
            if (this.state.orders.length > 10) {
                this.state.orders = this.state.orders.slice(0, 10);
            }

            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state.orders));
            this.updateOrderBadgeUI();
        } catch (err) {
            console.error('Gagal menyimpan ke localStorage:', err);
        }
    }

    loadOrdersFromStorage() {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            if (raw) {
                this.state.orders = JSON.parse(raw) || [];
            }
        } catch (err) {
            this.state.orders = [];
        }
    }

    updateOrderBadgeUI() {
        const count = this.state.orders.length;
        const badges = document.querySelectorAll('.order-history-badge');
        badges.forEach(b => {
            b.textContent = `${count} Pesanan`;
            if (count > 0) b.classList.remove('d-none');
        });

        const historyListEl = document.getElementById('orderHistoryList');
        if (historyListEl) {
            if (count === 0) {
                historyListEl.innerHTML = '<p class="text-muted small mb-0">Belum ada riwayat konsultasi.</p>';
            } else {
                historyListEl.innerHTML = this.state.orders.map(o => `
                    <div class="p-2 border rounded-2 mb-2 bg-light small">
                        <strong>${this.escapeHTML(o.nama)}</strong> • <span class="badge bg-primary-subtle text-primary">${this.escapeHTML(o.layanan)}</span>
                        <div class="text-muted smaller">${new Date(o.createdAt).toLocaleString('id-ID')} • ${this.escapeHTML(o.metode)}</div>
                    </div>
                `).join('');
            }
        }
    }

    setupStorageListener() {
        window.addEventListener('storage', (e) => {
            if (e.key === this.STORAGE_KEY) {
                this.loadOrdersFromStorage();
                this.updateOrderBadgeUI();
            }
        });
    }

    showToastNotification(title, message, type = 'success') {
        const toastEl = document.getElementById('appNotificationToast');
        if (!toastEl) return;

        const titleEl = document.getElementById('toastTitle');
        const bodyEl = document.getElementById('toastBody');
        const headerEl = toastEl.querySelector('.toast-header');

        if (titleEl) titleEl.textContent = title;
        if (bodyEl) bodyEl.innerHTML = message;

        if (headerEl) {
            headerEl.classList.remove('bg-success', 'bg-danger', 'bg-primary', 'text-white');
            headerEl.classList.add(type === 'danger' ? 'bg-danger' : 'bg-success', 'text-white');
        }

        const toast = bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 5000 });
        toast.show();
    }

    // Isi pilihan dropdown formulir layanan dari services.json
    populateServiceDropdown() {
        const selectEl = document.getElementById('floatingLayanan');
        if (!selectEl || !Array.isArray(this.state.services) || this.state.services.length === 0) return;

        const currentVal = selectEl.value;
        const optionsHTML = this.state.services.map(s => `
            <option value="${this.escapeHTML(s.name)}">${this.escapeHTML(s.name)} (${this.escapeHTML(s.sessionDuration)})</option>
        `).join('');

        selectEl.innerHTML = `
            <option value="" disabled ${!currentVal ? 'selected' : ''}>Pilih Kategori Layanan...</option>
            ${optionsHTML}
        `;

        if (currentVal) selectEl.value = currentVal;
    }
}

// Jalankan aplikasi saat HTML sudah siap
document.addEventListener('DOMContentLoaded', () => {
    window.portfolioApp = new PortfolioApp();
});
