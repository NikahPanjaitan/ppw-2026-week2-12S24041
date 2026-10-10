/**
 * @file app.js
 * @description Presentation Layer (Controller & View Manager) untuk Client-Side
 *              Rendering (CSR), penanganan 4 status UI, Universal Dynamic Modal,
 *              keamanan anti-DOM XSS, dan pengiriman formulir asinkron RESTful.
 * @author Nikah Suchia Panjaitan (NIM: 12S24041)
 * @course 12S3101 - Pemrograman dan Pengujian Web (Modul 04)
 */

class PortfolioApp {
    /**
     * State manajemen internal aplikasi di sisi klien
     */
    state = {
        projects: [],
        services: [],
        profile: null,
        activeFilter: 'all',
        orders: [],
        isLoading: true,
        error: null
    };

    /**
     * Kunci penyimpanan pada Web Storage (localStorage)
     */
    STORAGE_KEY = 'ppw_portfolio_service_orders_v4';

    constructor() {
        this.init();
    }

    /**
     * Inisialisasi siklus hidup aplikasi
     */
    async init() {
        this.loadOrdersFromStorage();
        this.updateOrderBadgeUI();
        this.setupFormListener();
        this.setupFilterListeners();
        this.setupStorageListener();

        // Muat data awal secara asinkron
        await this.loadInitialData();
    }

    /**
     * Sanitasi teks string untuk mencegah serangan DOM-based Cross-Site Scripting (XSS)
     * sebelum dimasukkan ke dalam elemen antarmuka via innerHTML.
     * @param {string} str 
     * @returns {string} String aman hasil encoding entitas HTML
     */
    escapeHTML(str) {
        if (str === null || str === undefined) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    /**
     * Mengambil data terstruktur dari decoupled JSON data providers
     */
    async loadInitialData() {
        const container = document.getElementById('portfolioContainer');
        this.renderLoadingState(container);

        try {
            // Ambil data proyek dan katalog layanan secara paralel
            const [projectsData, servicesData, profileData] = await Promise.all([
                ApiService.getProjects(),
                ApiService.getServices(),
                ApiService.getProfile()
            ]);

            this.state.projects = Array.isArray(projectsData) ? projectsData : [];
            this.state.services = Array.isArray(servicesData) ? servicesData : [];
            this.state.profile = profileData || null;
            this.state.isLoading = false;
            this.state.error = null;

            // Render antarmuka proyek
            this.renderFilteredProjects();

            // Populate pilihan dropdown formulir layanan jika elemen tersedia
            this.populateServiceDropdown();

        } catch (error) {
            console.error('[PortfolioApp Init Error]:', error);
            this.state.isLoading = false;
            this.state.error = error.message || 'Gagal memuat data portofolio.';
            this.renderErrorState(container, this.state.error);
        }
    }

    /* =========================================================================
     *  MANAJEMEN STATUS UI (4 UI STATES: LOADING, SUCCESS, EMPTY, ERROR)
     * ========================================================================= */

    /**
     * Status 1: Loading State (Menampilkan Skeleton Loader & Spinner)
     * @param {HTMLElement} container 
     */
    renderLoadingState(container) {
        if (!container) return;
        container.innerHTML = `
            <div class="col-12 text-center py-5" role="status" aria-live="polite">
                <div class="spinner-border text-primary mb-3" style="width: 3rem; height: 3rem;" role="status">
                    <span class="visually-hidden">Memuat data proyek...</span>
                </div>
                <h5 class="fw-bold text-dark">Memuat Data Proyek Akademik...</h5>
                <p class="text-muted small mb-4">Mengambil decoupled data JSON dari Presentation Layer.</p>
                
                <!-- Skeleton Placeholders -->
                <div class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 text-start">
                    ${[1, 2, 3].map(() => `
                        <div class="col">
                            <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden" aria-hidden="true">
                                <div class="placeholder-glow" style="height: 180px; background-color: #e9ecef;">
                                    <span class="placeholder col-12 h-100"></span>
                                </div>
                                <div class="card-body p-4">
                                    <span class="placeholder col-4 mb-2"></span>
                                    <h5 class="card-title placeholder-glow">
                                        <span class="placeholder col-8"></span>
                                    </h5>
                                    <p class="card-text placeholder-glow">
                                        <span class="placeholder col-12"></span>
                                        <span class="placeholder col-10"></span>
                                        <span class="placeholder col-7"></span>
                                    </p>
                                    <div class="mt-3 placeholder-glow">
                                        <span class="btn btn-primary disabled placeholder col-6"></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    /**
     * Status 2: Success State (Render Kartu Proyek Dinamis)
     * @param {HTMLElement} container 
     * @param {Array<object>} projects 
     */
    renderSuccessState(container, projects) {
        if (!container) return;

        container.innerHTML = projects.map((proj, index) => {
            const projectNumber = String(index + 1).padStart(2, '0');
            const safeTitle = this.escapeHTML(proj.title);
            const safeCategory = this.escapeHTML(proj.category);
            const safeSubtitle = this.escapeHTML(proj.subtitle);
            const safeShortDesc = this.escapeHTML(proj.shortDescription);
            const safeThumbnail = this.escapeHTML(proj.thumbnail);
            const safeBadgeType = this.escapeHTML(proj.badgeType || 'Dokumentasi');
            const safeBadgeIcon = this.escapeHTML(proj.badgeIcon || 'bi-patch-check-fill');

            const tagsHTML = (proj.tags || []).map(t => 
                `<span class="badge">${this.escapeHTML(t)}</span>`
            ).join(' ');

            const downloadButtonHTML = proj.downloadLink ? `
                <a
                    href="${this.escapeHTML(proj.downloadLink.url)}"
                    class="btn btn-outline-secondary btn-sm"
                    download
                    title="Unduh berkas lampiran ${safeTitle}"
                >
                    <i class="bi ${this.escapeHTML(proj.downloadLink.icon || 'bi-download')} me-1" aria-hidden="true"></i>
                    ${this.escapeHTML(proj.downloadLink.type ? proj.downloadLink.type.toUpperCase() : 'BERKAS')} ↗
                </a>
            ` : '';

            return `
                <div class="col">
                    <article class="card h-100 project-card documented-project-card shadow-sm border-0">
                        <!-- Thumbnail Cover -->
                        <div class="project-thumb-wrapper">
                            <img
                                src="${safeThumbnail}"
                                alt="${safeTitle}"
                                class="project-thumb-img"
                                loading="lazy"
                            >
                            <div class="project-thumb-overlay">
                                <span class="badge project-badge-num">PROYEK ${projectNumber}</span>
                                <span class="badge bg-success-subtle text-success border border-success-subtle">
                                    <i class="bi ${safeBadgeIcon} me-1" aria-hidden="true"></i>${safeBadgeType}
                                </span>
                            </div>
                        </div>

                        <!-- Konten Kartu -->
                        <div class="card-body d-flex flex-column project-content p-4">
                            <div class="d-flex align-items-center justify-content-between mb-1">
                                <span class="project-category">
                                    ${safeCategory}
                                </span>
                                <small class="text-muted fw-semibold">Proyek 0${index + 1}</small>
                            </div>

                            <h3 class="card-title fw-bold fs-5 text-dark mb-1">
                                ${safeTitle}
                            </h3>
                            <p class="small text-muted fw-semibold mb-2">
                                ${safeSubtitle}
                            </p>

                            <p class="card-text text-secondary small mb-3">
                                ${safeShortDesc}
                            </p>

                            <div class="project-tags mb-3">
                                ${tagsHTML}
                            </div>

                            <div class="mt-auto d-flex flex-wrap gap-2 pt-2 border-top">
                                <button
                                    type="button"
                                    class="btn btn-primary btn-sm project-btn px-3"
                                    onclick="window.portfolioApp.openProjectModal('${this.escapeHTML(proj.id)}')"
                                >
                                    <i class="bi bi-journal-text me-1" aria-hidden="true"></i>
                                    Buka Case Study
                                </button>
                                ${downloadButtonHTML}
                            </div>
                        </div>
                    </article>
                </div>
            `;
        }).join('');
    }

    /**
     * Status 3: Empty State (Kategori filter tidak memiliki item)
     * @param {HTMLElement} container 
     */
    renderEmptyState(container) {
        if (!container) return;
        container.innerHTML = `
            <div class="col-12 py-5 text-center">
                <div class="card border-dashed p-5 bg-light rounded-4 mx-auto" style="max-width: 580px;">
                    <div class="display-5 text-muted mb-3">
                        <i class="bi bi-folder-x"></i>
                    </div>
                    <h5 class="fw-bold text-dark">Tidak Ada Proyek Ditemukan</h5>
                    <p class="text-secondary small mb-4">
                        Tidak ada karya yang sesuai dengan filter kategori "<strong>${this.escapeHTML(this.state.activeFilter)}</strong>".
                    </p>
                    <div>
                        <button class="btn btn-primary btn-sm px-4" onclick="window.portfolioApp.setFilter('all')">
                            <i class="bi bi-arrow-counterclockwise me-1"></i> Tampilkan Semua Proyek
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Status 4: Error State (Kegagalan jaringan atau format JSON)
     * @param {HTMLElement} container 
     * @param {string} errorMessage 
     */
    renderErrorState(container, errorMessage) {
        if (!container) return;
        container.innerHTML = `
            <div class="col-12 py-5 text-center">
                <div class="alert alert-danger p-4 rounded-4 shadow-sm mx-auto" style="max-width: 620px;" role="alert">
                    <div class="d-flex align-items-center justify-content-center mb-2">
                        <i class="bi bi-exclamation-triangle-fill fs-2 me-2 text-danger"></i>
                        <h5 class="alert-heading fw-bold mb-0">Gagal Memuat Data Portofolio</h5>
                    </div>
                    <p class="small text-danger-emphasis mb-3">
                        ${this.escapeHTML(errorMessage || 'Terjadi kesalahan saat mengambil berkas data JSON.')}
                    </p>
                    <div class="d-flex justify-content-center gap-2">
                        <button class="btn btn-danger btn-sm px-4" onclick="window.portfolioApp.loadInitialData()">
                            <i class="bi bi-arrow-repeat me-1"></i> Coba Lagi (Retry)
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Melakukan filter pada daftar proyek dan memicu pembaruan DOM
     */
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

        // Perbarui jumlah badge count proyek
        const countBadge = document.getElementById('portfolioCountBadge');
        if (countBadge) {
            countBadge.textContent = `${String(filtered.length).padStart(2, '0')} Projects`;
        }
    }

    /**
     * Mengatur filter kategori proyek yang sedang aktif
     * @param {string} filterKey 
     */
    setFilter(filterKey) {
        this.state.activeFilter = filterKey;

        // Perbarui status kelas aktif pada tombol filter
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

    /**
     * Memasang event listener pada tombol filter kategori
     */
    setupFilterListeners() {
        const filterContainer = document.getElementById('portfolioFilterContainer');
        if (!filterContainer) return;

        filterContainer.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-filter]');
            if (!btn) return;
            const key = btn.getAttribute('data-filter');
            this.setFilter(key);
        });
    }

    /* =========================================================================
     *  UNIVERSAL DYNAMIC MODAL (1 MODAL TUNGGAL UNTUK SELURUH PROYEK)
     * ========================================================================= */

    /**
     * Membuka modal proyek tunggal secara dinamis berdasarkan projectId
     * @param {string} projectId 
     */
    openProjectModal(projectId) {
        const project = this.state.projects.find(p => p.id === projectId);
        if (!project) {
            console.warn(`[PortfolioApp] Proyek dengan ID "${projectId}" tidak ditemukan.`);
            return;
        }

        const modalEl = document.getElementById('universalProjectModal');
        const modalTitle = document.getElementById('projectModalTitle');
        const modalBody = document.getElementById('projectModalBody');

        if (!modalEl || !modalTitle || !modalBody) return;

        // Set judul modal
        modalTitle.textContent = project.title;

        // Render metrik badges
        const metricsHTML = (project.metrics || []).map(m => `
            <div class="col-6 col-md-3">
                <div class="p-3 bg-light border rounded-3 text-center h-100">
                    <span class="d-block text-muted smaller text-uppercase fw-bold">${this.escapeHTML(m.label)}</span>
                    <strong class="fs-4 text-primary d-block my-1">${this.escapeHTML(m.value)}</strong>
                    <span class="badge bg-secondary-subtle text-secondary smaller">${this.escapeHTML(m.context)}</span>
                </div>
            </div>
        `).join('');

        // Render galeri artefak
        const artifactsHTML = (project.artifacts || []).map(art => `
            <div class="col-12 col-md-6">
                <div class="card h-100 border shadow-sm rounded-3 overflow-hidden">
                    <img src="${this.escapeHTML(art.image)}" alt="${this.escapeHTML(art.title)}" class="card-img-top" loading="lazy">
                    <div class="card-body p-3">
                        <h6 class="fw-bold mb-1">${this.escapeHTML(art.title)}</h6>
                        <p class="small text-muted mb-0">${this.escapeHTML(art.caption)}</p>
                    </div>
                </div>
            </div>
        `).join('');

        // Render tags
        const tagsHTML = (project.tags || []).map(t => `
            <span class="badge bg-primary-subtle text-primary border border-primary-subtle">${this.escapeHTML(t)}</span>
        `).join(' ');

        // Render tombol unduh
        const downloadActionHTML = project.downloadLink ? `
            <a href="${this.escapeHTML(project.downloadLink.url)}" class="btn btn-primary" download>
                <i class="bi ${this.escapeHTML(project.downloadLink.icon || 'bi-download')} me-1" aria-hidden="true"></i>
                ${this.escapeHTML(project.downloadLink.label)}
            </a>
        ` : '';

        // Suntikkan konten ke dalam modal body secara terstruktur dan aman
        modalBody.innerHTML = `
            <!-- Header Cover Preview -->
            <div class="mb-4 rounded-3 overflow-hidden border">
                <img src="${this.escapeHTML(project.thumbnail)}" alt="${this.escapeHTML(project.title)}" class="img-fluid w-100" style="max-height: 380px; object-fit: cover;">
            </div>

            <!-- Meta & Subtitle -->
            <div class="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
                <span class="badge bg-primary px-3 py-2 fs-6">${this.escapeHTML(project.category)}</span>
                <span class="text-muted fw-semibold small">${this.escapeHTML(project.subtitle)}</span>
            </div>

            <!-- Ringkasan Angka Metrik -->
            <div class="row g-2 mb-4">
                ${metricsHTML}
            </div>

            <!-- Deskripsi Lengkap -->
            <div class="mb-4">
                <h6 class="fw-bold text-dark border-bottom pb-2">
                    <i class="bi bi-file-text me-1 text-primary"></i> Deskripsi & Analisis Lengkap
                </h6>
                <p class="text-secondary" style="line-height: 1.8;">
                    ${this.escapeHTML(project.fullDescription)}
                </p>
            </div>

            <!-- Galeri Artefak Diagram Otentik -->
            <div class="mb-4">
                <h6 class="fw-bold text-dark border-bottom pb-2">
                    <i class="bi bi-images me-1 text-primary"></i> Galeri Artefak Diagram Pemodelan
                </h6>
                <div class="row g-3 mt-1">
                    ${artifactsHTML}
                </div>
            </div>

            <!-- Tags Stack -->
            <div class="mb-4">
                <h6 class="fw-bold text-dark border-bottom pb-2">
                    <i class="bi bi-tags me-1 text-primary"></i> Kompetensi & Perangkat yang Diterapkan
                </h6>
                <div class="d-flex flex-wrap gap-2 mt-2">
                    ${tagsHTML}
                </div>
            </div>

            <!-- Footer Aksi -->
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 pt-3 border-top">
                <div>${downloadActionHTML}</div>
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                    Tutup Dialog
                </button>
            </div>
        `;

        // Tampilkan modal menggunakan Bootstrap 5 JavaScript API
        const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
        modalInstance.show();
    }

    /* =========================================================================
     *  DECOUPLED ASYNCHRONOUS FORM DISPATCH & TOAST NOTIFICATION
     * ========================================================================= */

    /**
     * Memasang event listener pada formulir layanan konsultasi
     */
    setupFormListener() {
        const form = document.querySelector('.contact-form');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault(); // Mencegah reload halaman standar browser

            // Validasi native HTML5
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnHTML = submitBtn ? submitBtn.innerHTML : 'Kirim Permintaan';

            // Ubah tombol submit menjadi disabled + visual spinner
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `
                    <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Mengirim Permintaan...
                `;
            }

            // Ekstraksi data formulir
            const formData = new FormData(form);
            const payload = Object.fromEntries(formData.entries());

            try {
                // Kirim via Data Access Layer ApiService (simulasi HTTP POST 800ms)
                const response = await ApiService.submitServiceOrder(payload);

                // Simpan ke localStorage secara persisten
                this.saveOrderToLocalStorage(response.data);

                // Tampilkan notifikasi Bootstrap Toast
                this.showToastNotification(
                    'Pemesanan Berhasil Terkirim!',
                    `Halo <strong>${this.escapeHTML(payload.nama)}</strong>, permintaan konsultasi Anda untuk topik <em>"${this.escapeHTML(payload.layanan)}"</em> berhasil diproses.`
                );

                // Reset formulir
                form.reset();

            } catch (err) {
                console.error('[PortfolioApp Form Submit Error]:', err);
                this.showToastNotification(
                    'Gagal Mengirim Permintaan',
                    err.message || 'Terjadi gangguan saat memproses formulir. Silakan coba kembali.',
                    'danger'
                );
            } finally {
                // Kembalikan state tombol submit
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnHTML;
                }
            }
        });
    }

    /**
     * Menyimpan riwayat pesanan ke localStorage
     * @param {object} orderData 
     */
    saveOrderToLocalStorage(orderData) {
        try {
            const newOrder = {
                id: `ORD-${Date.now()}`,
                ...orderData,
                createdAt: new Date().toISOString()
            };

            this.state.orders.unshift(newOrder);

            // Batasi riwayat maksimal 10 transaksi terakhir
            if (this.state.orders.length > 10) {
                this.state.orders = this.state.orders.slice(0, 10);
            }

            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state.orders));
            this.updateOrderBadgeUI();
        } catch (err) {
            console.error('[PortfolioApp LocalStorage Error]:', err);
        }
    }

    /**
     * Memuat riwayat pesanan dari localStorage saat startup
     */
    loadOrdersFromStorage() {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                this.state.orders = Array.isArray(parsed) ? parsed : [];
            }
        } catch (err) {
            console.warn('[PortfolioApp] Gagal membaca riwayat localStorage:', err);
            this.state.orders = [];
        }
    }

    /**
     * Memperbarui counter badge pemesanan aktif pada UI
     */
    updateOrderBadgeUI() {
        const count = this.state.orders.length;
        const badges = document.querySelectorAll('.order-history-badge');
        badges.forEach(b => {
            b.textContent = `${count} Pesanan`;
            if (count > 0) {
                b.classList.remove('d-none');
            }
        });

        // Update container riwayat pesanan jika ada
        const historyListEl = document.getElementById('orderHistoryList');
        if (historyListEl) {
            if (count === 0) {
                historyListEl.innerHTML = '<p class="text-muted small mb-0">Belum ada riwayat konsultasi yang tersimpan.</p>';
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

    /**
     * Memasang listener agar sinkronisasi localStorage antar tab browser terjaga
     */
    setupStorageListener() {
        window.addEventListener('storage', (e) => {
            if (e.key === this.STORAGE_KEY) {
                this.loadOrdersFromStorage();
                this.updateOrderBadgeUI();
            }
        });
    }

    /**
     * Menampilkan notifikasi Bootstrap Toast di sudut layar
     * @param {string} title Judul notifikasi
     * @param {string} message Pesan notifikasi
     * @param {string} type Tipe tema ('success' | 'danger' | 'info')
     */
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
            if (type === 'danger') {
                headerEl.classList.add('bg-danger', 'text-white');
            } else {
                headerEl.classList.add('bg-success', 'text-white');
            }
        }

        const toast = bootstrap.Toast.getOrCreateInstance(toastEl, { delay: 6000 });
        toast.show();
    }

    /**
     * Mengisi dropdown layanan konsultasi dari data services.json
     */
    populateServiceDropdown() {
        const selectEl = document.getElementById('floatingLayanan');
        if (!selectEl || !Array.isArray(this.state.services) || this.state.services.length === 0) return;

        // Pertahankan opsi placeholder awal
        const currentVal = selectEl.value;
        const optionsHTML = this.state.services.map(s => `
            <option value="${this.escapeHTML(s.name)}">${this.escapeHTML(s.name)} (${this.escapeHTML(s.sessionDuration)})</option>
        `).join('');

        selectEl.innerHTML = `
            <option value="" disabled ${!currentVal ? 'selected' : ''}>Pilih Kategori Layanan...</option>
            ${optionsHTML}
        `;

        if (currentVal) {
            selectEl.value = currentVal;
        }
    }
}

// Inisialisasi aplikasi saat dokumen HTML siap
document.addEventListener('DOMContentLoaded', () => {
    window.portfolioApp = new PortfolioApp();
});
