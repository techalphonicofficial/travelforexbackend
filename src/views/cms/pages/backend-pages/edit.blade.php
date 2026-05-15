<x-layouts.backend title="Edit Page & Builder">
    @push('styles')
    <script src="https://cdn.jsdelivr.net/npm/sortablejs@1.15.0/Sortable.min.js"></script>
    <script src="https://cdn.ckeditor.com/ckeditor5/41.1.0/classic/ckeditor.js"></script>
    <style>
        .ck-editor__editable { min-height: 300px; border-radius: 0 0 0.5rem 0.5rem !important; }
        .ck-toolbar { border-radius: 0.5rem 0.5rem 0 0 !important; }
        .section-item { transition: all 0.2s ease; border-left: 4px solid transparent; }
        .section-item:hover { border-left-color: var(--bs-primary); cursor: grab; }
        .section-item.active { border-left-color: var(--bs-primary); background-color: var(--bs-light); }
        .ghost { opacity: 0.5; background: #c8ebfb; }
        .builder-canvas { min-height: 400px; background: #f8f9fa; border: 2px dashed #dee2e6; border-radius: 1rem; }
    </style>
    @endpush

    <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
            <a href="{{ route('admin.pages.index') }}" class="btn btn-link text-decoration-none p-0 mb-1 text-muted">
                <i class="bi bi-arrow-left me-1"></i>Back to Pages
            </a>
            <h4 class="fw-bold mb-0">Page Builder: {{ $page->title }}</h4>
        </div>
        <div class="d-flex gap-2">
            <button type="button" class="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#pageSettingsModal">
                <i class="bi bi-gear me-2"></i>Page Settings
            </button>
            <button type="button" class="btn btn-primary" onclick="saveSections()">
                <i class="bi bi-save me-2"></i>Save Final Page
            </button>
        </div>
    </div>

    <div class="row g-4">
        <!-- Section Types Sidebar -->
        <div class="col-lg-3">
            <div class="card border-0 shadow-sm sticky-top" style="top: 100px; z-index: 1020;">
                <div class="card-body p-4">
                    <h6 class="fw-bold mb-4">Add Content Sections</h6>
                    <div class="d-grid gap-2">
                        <button type="button" class="btn btn-outline-secondary text-start p-3" onclick="addSection('rich_text')">
                            <i class="bi bi-fonts me-2"></i>Rich Text Block
                        </button>
                        <button type="button" class="btn btn-outline-secondary text-start p-3" onclick="addSection('image_text')">
                            <i class="bi bi-layout-split me-2"></i>Image & Text
                        </button>
                        <button type="button" class="btn btn-outline-secondary text-start p-3" onclick="addSection('faq_accordion')">
                            <i class="bi bi-question-circle me-2"></i>FAQ Accordion
                        </button>
                        <button type="button" class="btn btn-outline-secondary text-start p-3" onclick="addSection('stats_bar')">
                            <i class="bi bi-graph-up me-2"></i>Stats Bar
                        </button>
                        <button type="button" class="btn btn-outline-secondary text-start p-3" onclick="addSection('feature_grid')">
                            <i class="bi bi-grid-3x3-gap me-2"></i>Feature/Icon Grid
                        </button>
                        <button type="button" class="btn btn-outline-secondary text-start p-3" onclick="addSection('testimonial_grid')">
                            <i class="bi bi-chat-quote me-2"></i>Testimonial Grid
                        </button>
                        <button type="button" class="btn btn-outline-secondary text-start p-3" onclick="addSection('timeline')">
                            <i class="bi bi-hourglass-split me-2"></i>Brand Timeline
                        </button>
                        <button type="button" class="btn btn-outline-secondary text-start p-3" onclick="addSection('video_block')">
                            <i class="bi bi-play-circle me-2"></i>Video / Parallax
                        </button>
                        <button type="button" class="btn btn-outline-secondary text-start p-3" onclick="addSection('cta_banner')">
                            <i class="bi bi-megaphone me-2"></i>CTA Banner
                        </button>
                    </div>
                    <hr class="my-4">
                    <div class="alert alert-info py-2 small mb-0">
                        <i class="bi bi-info-circle me-2"></i>Drag sections to reorder them on the page.
                    </div>
                </div>
            </div>
        </div>

        <!-- Builder Canvas -->
        <div class="col-lg-9">
            <div id="sectionContainer" class="builder-canvas p-4 d-flex flex-column gap-3">
                @forelse($page->sections as $section)
                    <div class="card border-0 shadow-sm section-item" data-id="{{ $section->id }}" data-type="{{ $section->type }}">
                        <div class="card-body p-4">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <div class="d-flex align-items-center gap-2">
                                    <i class="bi bi-grip-vertical text-muted fs-4"></i>
                                    <span class="badge bg-primary-subtle text-primary text-uppercase">{{ str_replace('_', ' ', $section->type) }}</span>
                                </div>
                                <div class="btn-group">
                                    <button class="btn btn-sm btn-light" onclick="editSection(this)"><i class="bi bi-pencil me-1"></i>Configure</button>
                                    <button class="btn btn-sm btn-light text-danger" onclick="removeSection(this)"><i class="bi bi-trash"></i></button>
                                </div>
                            </div>
                            <div class="section-preview small text-muted">
                                <!-- Preview logic based on type -->
                                @if($section->type == 'rich_text')
                                    {!! Str::limit(strip_tags($section->content['body'] ?? ''), 150) !!}
                                @else
                                    Configure this section to see preview.
                                @endif
                            </div>
                            <input type="hidden" class="section-content-data" value="{{ json_encode($section->content) }}">
                        </div>
                    </div>
                @empty
                    <div class="empty-state text-center py-5">
                        <i class="bi bi-plus-circle fs-1 text-muted mb-3 d-block"></i>
                        <h5>No sections added yet</h5>
                        <p class="text-muted">Click the buttons on the left to add your first content block.</p>
                    </div>
                @endforelse
            </div>
        </div>
    </div>

    <!-- Modals for Editing (Generic) -->
    <div class="modal fade" id="sectionEditModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header border-0 pb-0">
                    <h5 class="modal-title fw-bold">Configure Section</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body p-4" id="sectionEditForm">
                    <!-- Form generated by JS -->
                </div>
                <div class="modal-footer border-0">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="button" class="btn btn-primary px-4" onclick="updateSectionData()">Apply Changes</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Page Settings Modal -->
    <div class="modal fade" id="pageSettingsModal" tabindex="-1" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <form action="{{ route('admin.pages.update', $page) }}" method="POST">
                    @csrf
                    @method('PUT')
                    <div class="modal-header border-bottom">
                        <h5 class="modal-title fw-bold">Page Settings</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body p-4">
                        <div class="mb-3">
                            <label class="form-label fw-semibold">Title</label>
                            <input type="text" name="title" class="form-control" value="{{ $page->title }}" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label fw-semibold">Slug</label>
                            <input type="text" name="slug" class="form-control" value="{{ $page->slug }}" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label fw-semibold">Meta Description</label>
                            <textarea name="meta_description" class="form-control" rows="2">{{ $page->meta_description }}</textarea>
                        </div>
                        <div class="mb-3">
                            <label class="form-label fw-semibold">Meta Keywords</label>
                            <textarea name="meta_keywords" class="form-control" rows="2">{{ $page->meta_keywords }}</textarea>
                        </div>
                        <div class="mb-3">
                            <label class="form-label fw-semibold">Schema Markup (JSON-LD)</label>
                            <textarea name="schema_markup" class="form-control" rows="4" placeholder='<script type="application/ld+json">...</script>'>{{ $page->schema_markup }}</textarea>
                        </div>
                        <div class="form-check form-switch mb-0">
                            <input type="hidden" name="status" value="0">
                            <input class="form-check-input" type="checkbox" name="status" id="pageStatus" value="1" {{ $page->status ? 'checked' : '' }}>
                            <label class="form-check-label" for="pageStatus">Active / Published</label>
                        </div>
                    </div>
                    <div class="modal-footer border-top bg-light">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="submit" class="btn btn-primary px-4">Update Settings</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    
    <!-- Global media picker component (renders modal once) -->
    <x-backend.media-picker name="global_picker" :preview="false" label="" />
    <style>#mediaPicker_global_picker { display: none; }</style>

    @push('scripts')
    <script>
        const sectionContainer = document.getElementById('sectionContainer');
        let activeEditElement = null;

        // Initialize Sorting
        new Sortable(sectionContainer, {
            animation: 150,
            ghostClass: 'ghost',
            handle: '.bi-grip-vertical'
        });

        function addSection(type) {
            // Remove empty state if exists
            const emptyState = sectionContainer.querySelector('.empty-state');
            if(emptyState) emptyState.remove();

            const div = document.createElement('div');
            div.className = 'card border-0 shadow-sm section-item';
            div.dataset.type = type;
            div.innerHTML = `
                <div class="card-body p-4">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <div class="d-flex align-items-center gap-2">
                            <i class="bi bi-grip-vertical text-muted fs-4"></i>
                            <span class="badge bg-primary-subtle text-primary text-uppercase">${type.replace('_', ' ')}</span>
                        </div>
                        <div class="btn-group">
                            <button class="btn btn-sm btn-light" onclick="editSection(this)"><i class="bi bi-pencil me-1"></i>Configure</button>
                            <button class="btn btn-sm btn-light text-danger" onclick="removeSection(this)"><i class="bi bi-trash"></i></button>
                        </div>
                    </div>
                    <div class="section-preview small text-muted">New ${type} section added. Please configure it.</div>
                    <input type="hidden" class="section-content-data" value="{}">
                </div>
            `;
            sectionContainer.appendChild(div);
        }

        function removeSection(button) {
            if(confirm('Delete this section?')) {
                button.closest('.section-item').remove();
                if(sectionContainer.children.length === 0) {
                    sectionContainer.innerHTML = '<div class="empty-state text-center py-5"><i class="bi bi-plus-circle fs-1 text-muted mb-3 d-block"></i><h5>No sections added yet</h5><p class="text-muted">Click the buttons on the left to add your first content block.</p></div>';
                }
            }
        }

        function editSection(button) {
            activeEditElement = button.closest('.section-item');
            const type = activeEditElement.dataset.type;
            const content = JSON.parse(activeEditElement.querySelector('.section-content-data').value || '{}');
            const formContainer = document.getElementById('sectionEditForm');
            
            formContainer.innerHTML = ''; // Clear

            if(type === 'rich_text') {
                formContainer.innerHTML = `
                    <div class="mb-3">
                        <label class="form-label fw-bold">Body Content</label>
                        <textarea id="sectionEditor" class="form-control">${content.body || ''}</textarea>
                    </div>
                `;
                initCKEditor('#sectionEditor');
            } else if(type === 'image_text') {
                formContainer.innerHTML = `
                    <div class="row">
                        <div class="col-md-8">
                            <div class="mb-3">
                                <label class="form-label fw-bold">Title (Optional)</label>
                                <input type="text" class="form-control" id="it_title" value="${content.title || ''}">
                            </div>
                            <div class="mb-3">
                                <label class="form-label fw-bold">Body Content</label>
                                <textarea id="sectionEditor" class="form-control">${content.body || ''}</textarea>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="mb-3">
                                <label class="form-label fw-bold">Image</label>
                                <div class="media-picker-wrapper" id="mediaPicker_it_image">
                                    <div class="preview-container border rounded mb-2 d-flex align-items-center justify-content-center bg-light" style="height: 150px; cursor: pointer;" onclick="openMediaPicker('it_image')">
                                        ${(() => {
                                            let finalUrl = content.image_url;
                                            if(finalUrl && !finalUrl.startsWith('http') && !finalUrl.startsWith('/')) {
                                                finalUrl = '/storage/' + finalUrl;
                                            }
                                            return finalUrl ? `<img src="${finalUrl}" class="img-fluid h-100 object-fit-cover shadow-sm">` : '<i class="bi bi-plus-lg fs-2 text-muted"></i>';
                                        })()}
                                    </div>
                                    <div class="input-group">
                                        <input type="text" class="form-control form-control-sm bg-light" id="media_display_it_image" value="${content.image_url ? content.image_url.split('/').pop() : ''}" readonly>
                                        <input type="hidden" id="media_path_it_image" value="${content.image_url || ''}">
                                        <input type="hidden" id="media_id_it_image" value="${content.image_id || ''}">
                                        <button class="btn btn-sm btn-outline-primary" type="button" onclick="openMediaPicker('it_image')">
                                            <i class="bi bi-image me-1"></i>Choose
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label fw-bold">Image Position</label>
                                <select class="form-select" id="it_side">
                                    <option value="left" ${content.side === 'left' ? 'selected' : ''}>Left</option>
                                    <option value="right" ${content.side === 'right' ? 'selected' : ''}>Right</option>
                                </select>
                            </div>
                        </div>
                    </div>
                `;
                initCKEditor('#sectionEditor');
            } else if(type === 'faq_accordion') {
                let faqHtml = '';
                const faqs = content.faqs || [{q: '', a: ''}];
                faqs.forEach((faq, index) => {
                    faqHtml += `
                        <div class="faq-item border rounded p-3 mb-3 bg-white position-relative">
                            <button type="button" class="btn-close position-absolute top-0 end-0 m-2" onclick="this.parentElement.remove()"></button>
                            <div class="mb-2">
                                <input type="text" class="form-control fw-bold faq-q" placeholder="Question" value="${faq.q}">
                            </div>
                            <div>
                                <textarea class="form-control faq-a" rows="2" placeholder="Answer">${faq.a}</textarea>
                            </div>
                        </div>
                    `;
                });
                formContainer.innerHTML = `
                    <div class="mb-3">
                        <label class="form-label fw-bold d-flex justify-content-between align-items-center">
                            FAQs Items
                            <button type="button" class="btn btn-sm btn-outline-primary" onclick="addFaqItem()">Add Item</button>
                        </label>
                        <div id="faqList">${faqHtml}</div>
                    </div>
                `;
            } else if(type === 'stats_bar') {
                let statsHtml = '';
                const stats = content.stats || [{label: '', value: ''}];
                stats.forEach((stat, index) => {
                    statsHtml += `
                        <div class="stat-item border rounded p-3 mb-3 bg-white position-relative">
                            <button type="button" class="btn-close position-absolute top-0 end-0 m-2" onclick="this.parentElement.remove()"></button>
                            <div class="row">
                                <div class="col-md-4">
                                    <input type="text" class="form-control fw-bold stat-value" placeholder="e.g. 25+" value="${stat.value}">
                                </div>
                                <div class="col-md-8">
                                    <input type="text" class="form-control stat-label" placeholder="e.g. Years of Experience" value="${stat.label}">
                                </div>
                            </div>
                        </div>
                    `;
                });
                formContainer.innerHTML = `
                    <div class="mb-3">
                        <label class="form-label fw-bold d-flex justify-content-between align-items-center">
                            Stats Items
                            <button type="button" class="btn btn-sm btn-outline-primary" onclick="addStatItem()">Add Stat</button>
                        </label>
                        <div id="statsList">${statsHtml}</div>
                    </div>
                `;
            } else if(type === 'feature_grid') {
                let featuresHtml = '';
                const features = content.features || [{title: '', desc: '', icon: 'bi-gem'}];
                features.forEach((feature, index) => {
                    featuresHtml += `
                        <div class="feature-item border rounded p-3 mb-3 bg-white position-relative">
                            <button type="button" class="btn-close position-absolute top-0 end-0 m-2" onclick="this.parentElement.remove()"></button>
                            <div class="row g-2">
                                <div class="col-md-3">
                                    <label class="small text-muted">Bootstrap Icon</label>
                                    <input type="text" class="form-control form-control-sm feat-icon" placeholder="bi-gem" value="${feature.icon || 'bi-gem'}">
                                </div>
                                <div class="col-md-9">
                                    <label class="small text-muted">Title</label>
                                    <input type="text" class="form-control form-control-sm feat-title mb-2" placeholder="Feature Title" value="${feature.title}">
                                    <label class="small text-muted">Description</label>
                                    <textarea class="form-control form-control-sm feat-desc" rows="2" placeholder="Description">${feature.desc}</textarea>
                                </div>
                            </div>
                        </div>
                    `;
                });
                formContainer.innerHTML = `
                    <div class="mb-3">
                        <div class="mb-3">
                            <label class="form-label fw-bold">Grid Headline (Optional)</label>
                            <input type="text" class="form-control" id="feat_headline" value="${content.headline || ''}">
                        </div>
                        <label class="form-label fw-bold d-flex justify-content-between align-items-center">
                            Features List
                            <button type="button" class="btn btn-sm btn-outline-primary" onclick="addFeatureItem()">Add Feature</button>
                        </label>
                        <div id="featuresList">${featuresHtml}</div>
                    </div>
                `;
            } else if(type === 'testimonial_grid') {
                let testimonialsHtml = '';
                const testimonials = content.testimonials || [{name: '', text: '', title: ''}];
                testimonials.forEach((t, index) => {
                    testimonialsHtml += `
                        <div class="testimonial-item border rounded p-3 mb-3 bg-white position-relative">
                            <button type="button" class="btn-close position-absolute top-0 end-0 m-2" onclick="this.parentElement.remove()"></button>
                            <div class="mb-2">
                                <input type="text" class="form-control fw-bold test-name" placeholder="Client Name" value="${t.name}">
                            </div>
                            <div class="mb-2">
                                <input type="text" class="form-control form-control-sm test-title" placeholder="Client Subtitle (e.g. Verified Buyer)" value="${t.title || ''}">
                            </div>
                            <div>
                                <textarea class="form-control test-text" rows="2" placeholder="Testimonial content">${t.text}</textarea>
                            </div>
                        </div>
                    `;
                });
                formContainer.innerHTML = `
                    <div class="mb-3">
                        <label class="form-label fw-bold d-flex justify-content-between align-items-center">
                            Testimonials
                            <button type="button" class="btn btn-sm btn-outline-primary" onclick="addTestimonialItem()">Add Testimonial</button>
                        </label>
                        <div id="testimonialList">${testimonialsHtml}</div>
                    </div>
                `;
            } else if(type === 'timeline') {
                let timelineHtml = '';
                const items = content.items || [{year: '', title: '', desc: ''}];
                items.forEach((item, index) => {
                    timelineHtml += `
                        <div class="timeline-item-form border rounded p-3 mb-3 bg-white position-relative">
                            <button type="button" class="btn-close position-absolute top-0 end-0 m-2" onclick="this.parentElement.remove()"></button>
                            <div class="row g-2">
                                <div class="col-md-3">
                                    <input type="text" class="form-control time-year" placeholder="Year (e.g. 1995)" value="${item.year}">
                                </div>
                                <div class="col-md-9">
                                    <input type="text" class="form-control fw-bold time-title mb-2" placeholder="Event Title" value="${item.title}">
                                    <textarea class="form-control time-desc" rows="2" placeholder="Event Description">${item.desc}</textarea>
                                </div>
                            </div>
                        </div>
                    `;
                });
                formContainer.innerHTML = `
                    <div class="mb-3">
                        <div class="mb-3">
                            <label class="form-label fw-bold">Timeline Title</label>
                            <input type="text" class="form-control" id="time_headline" value="${content.headline || ''}">
                        </div>
                        <label class="form-label fw-bold d-flex justify-content-between align-items-center">
                            History Milestones
                            <button type="button" class="btn btn-sm btn-outline-primary" onclick="addTimelineItem()">Add Milestone</button>
                        </label>
                        <div id="timelineList">${timelineHtml}</div>
                    </div>
                `;
            } else if(type === 'video_block') {
                formContainer.innerHTML = `
                    <div class="mb-3">
                        <label class="form-label fw-bold">Video URL (YouTube/Vimeo Link)</label>
                        <input type="text" class="form-control" id="vid_url" value="${content.video_url || ''}" placeholder="https://www.youtube.com/watch?v=...">
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-bold">Overlay Headline</label>
                        <input type="text" class="form-control" id="vid_title" value="${content.title || ''}">
                    </div>
                    <div class="mb-3">
                        <label class="form-label fw-bold">Cover Image</label>
                        <div class="media-picker-wrapper" id="mediaPicker_vid_cover">
                            <div class="preview-container border rounded mb-2 d-flex align-items-center justify-content-center bg-light" style="height: 150px; cursor: pointer;" onclick="openMediaPicker('vid_cover')">
                                ${content.cover_url ? `<img src="${content.cover_url.startsWith('http') ? content.cover_url : '/storage/' + content.cover_url}" class="img-fluid h-100 object-fit-cover shadow-sm">` : '<i class="bi bi-plus-lg fs-2 text-muted"></i>'}
                            </div>
                            <div class="input-group">
                                <input type="text" class="form-control form-control-sm bg-light" id="media_display_vid_cover" value="${content.cover_url ? content.cover_url.split('/').pop() : ''}" readonly>
                                <input type="hidden" id="media_path_vid_cover" value="${content.cover_url || ''}">
                                <button class="btn btn-sm btn-outline-primary" type="button" onclick="openMediaPicker('vid_cover')">Choose</button>
                            </div>
                        </div>
                    </div>
                `;
            } else if(type === 'cta_banner') {
                formContainer.innerHTML = `
                    <div class="mb-3">
                        <label class="form-label fw-bold">Headline</label>
                        <input type="text" class="form-control" id="cta_title" value="${content.title || ''}">
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Button Text</label>
                            <input type="text" class="form-control" id="cta_btn_text" value="${content.btn_text || ''}">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Button Link</label>
                            <input type="text" class="form-control" id="cta_btn_link" value="${content.btn_link || ''}">
                        </div>
                    </div>
                `;
            }

            const modal = new bootstrap.Modal(document.getElementById('sectionEditModal'));
            modal.show();
        }

        function addFaqItem() {
            const div = document.createElement('div');
            div.className = 'faq-item border rounded p-3 mb-3 bg-white position-relative';
            div.innerHTML = `
                <button type="button" class="btn-close position-absolute top-0 end-0 m-2" onclick="this.parentElement.remove()"></button>
                <div class="mb-2">
                    <input type="text" class="form-control fw-bold faq-q" placeholder="Question">
                </div>
                <div>
                    <textarea class="form-control faq-a" rows="2" placeholder="Answer"></textarea>
                </div>
            `;
            document.getElementById('faqList').appendChild(div);
        }

        function addStatItem() {
            const div = document.createElement('div');
            div.className = 'stat-item border rounded p-3 mb-3 bg-white position-relative';
            div.innerHTML = `
                <button type="button" class="btn-close position-absolute top-0 end-0 m-2" onclick="this.parentElement.remove()"></button>
                <div class="row">
                    <div class="col-md-4">
                        <input type="text" class="form-control fw-bold stat-value" placeholder="e.g. 25+">
                    </div>
                    <div class="col-md-8">
                        <input type="text" class="form-control stat-label" placeholder="e.g. Years of Experience">
                    </div>
                </div>
            `;
            document.getElementById('statsList').appendChild(div);
        }

        function addFeatureItem() {
            const div = document.createElement('div');
            div.className = 'feature-item border rounded p-3 mb-3 bg-white position-relative';
            div.innerHTML = `
                <button type="button" class="btn-close position-absolute top-0 end-0 m-2" onclick="this.parentElement.remove()"></button>
                <div class="row g-2">
                    <div class="col-md-3">
                        <label class="small text-muted">Bootstrap Icon</label>
                        <input type="text" class="form-control form-control-sm feat-icon" placeholder="bi-gem" value="bi-gem">
                    </div>
                    <div class="col-md-9">
                        <label class="small text-muted">Title</label>
                        <input type="text" class="form-control form-control-sm feat-title mb-2" placeholder="Feature Title">
                        <label class="small text-muted">Description</label>
                        <textarea class="form-control form-control-sm feat-desc" rows="2" placeholder="Description"></textarea>
                    </div>
                </div>
            `;
            document.getElementById('featuresList').appendChild(div);
        }

        function addTestimonialItem() {
            const div = document.createElement('div');
            div.className = 'testimonial-item border rounded p-3 mb-3 bg-white position-relative';
            div.innerHTML = `
                <button type="button" class="btn-close position-absolute top-0 end-0 m-2" onclick="this.parentElement.remove()"></button>
                <div class="mb-2">
                    <input type="text" class="form-control fw-bold test-name" placeholder="Client Name">
                </div>
                <div class="mb-2">
                    <input type="text" class="form-control form-control-sm test-title" placeholder="Client Subtitle">
                </div>
                <div>
                    <textarea class="form-control test-text" rows="2" placeholder="Testimonial content"></textarea>
                </div>
            `;
            document.getElementById('testimonialList').appendChild(div);
        }

        function addTimelineItem() {
            const div = document.createElement('div');
            div.className = 'timeline-item-form border rounded p-3 mb-3 bg-white position-relative';
            div.innerHTML = `
                <button type="button" class="btn-close position-absolute top-0 end-0 m-2" onclick="this.parentElement.remove()"></button>
                <div class="row g-2">
                    <div class="col-md-3">
                        <input type="text" class="form-control time-year" placeholder="Year (e.g. 1995)">
                    </div>
                    <div class="col-md-9">
                        <input type="text" class="form-control fw-bold time-title mb-2" placeholder="Event Title">
                        <textarea class="form-control time-desc" rows="2" placeholder="Event Description"></textarea>
                    </div>
                </div>
            `;
            document.getElementById('timelineList').appendChild(div);
        }

        let editorInstance = null;

        function initCKEditor(selector) {
            if (editorInstance) {
                editorInstance.destroy().then(() => {
                    createEditor(selector);
                });
            } else {
                createEditor(selector);
            }
        }

        function createEditor(selector) {
            ClassicEditor
                .create(document.querySelector(selector), {
                    toolbar: ['heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', '|', 'undo', 'redo']
                })
                .then(editor => {
                    editorInstance = editor;
                })
                .catch(error => {
                    console.error(error);
                });
        }

        function updateSectionData() {
            const type = activeEditElement.dataset.type;
            let content = {};
            let previewText = '';

            if(type === 'rich_text') {
                content.body = editorInstance.getData();
                previewText = content.body.replace(/<[^>]*>/g, '').substring(0, 150) + '...';
            } else if(type === 'image_text') {
                content.title = document.getElementById('it_title').value;
                content.body = editorInstance.getData();
                content.image_id = document.getElementById('media_id_it_image').value;
                content.image_url = document.getElementById('media_path_it_image').value;
                content.side = document.getElementById('it_side').value;
                previewText = `Image & Text: ${content.title || 'Untitled'} (Image at ${content.side})`;
            } else if(type === 'faq_accordion') {
                content.faqs = [];
                document.querySelectorAll('.faq-item').forEach(item => {
                    content.faqs.push({
                        q: item.querySelector('.faq-q').value,
                        a: item.querySelector('.faq-a').value
                    });
                });
                previewText = `FAQ Accordion: ${content.faqs.length} items`;
            } else if(type === 'stats_bar') {
                content.stats = [];
                document.querySelectorAll('.stat-item').forEach(item => {
                    content.stats.push({
                        value: item.querySelector('.stat-value').value,
                        label: item.querySelector('.stat-label').value
                    });
                });
                previewText = `Stats Bar: ${content.stats.length} items`;
            } else if(type === 'feature_grid') {
                content.headline = document.getElementById('feat_headline').value;
                content.features = [];
                document.querySelectorAll('.feature-item').forEach(item => {
                    content.features.push({
                        icon: item.querySelector('.feat-icon').value,
                        title: item.querySelector('.feat-title').value,
                        desc: item.querySelector('.feat-desc').value
                    });
                });
                previewText = `Feature Grid: ${content.features.length} items`;
            } else if(type === 'testimonial_grid') {
                content.testimonials = [];
                document.querySelectorAll('.testimonial-item').forEach(item => {
                    content.testimonials.push({
                        name: item.querySelector('.test-name').value,
                        title: item.querySelector('.test-title').value,
                        text: item.querySelector('.test-text').value
                    });
                });
                previewText = `Testimonials: ${content.testimonials.length} items`;
            } else if(type === 'timeline') {
                content.headline = document.getElementById('time_headline').value;
                content.items = [];
                document.querySelectorAll('.timeline-item-form').forEach(item => {
                    content.items.push({
                        year: item.querySelector('.time-year').value,
                        title: item.querySelector('.time-title').value,
                        desc: item.querySelector('.time-desc').value
                    });
                });
                previewText = `Timeline: ${content.items.length} milestones`;
            } else if(type === 'video_block') {
                content.video_url = document.getElementById('vid_url').value;
                content.title = document.getElementById('vid_title').value;
                content.cover_url = document.getElementById('media_path_vid_cover').value;
                previewText = `Video: ${content.title || 'Untitled'}`;
            } else if(type === 'cta_banner') {
                content.title = document.getElementById('cta_title').value;
                content.btn_text = document.getElementById('cta_btn_text').value;
                content.btn_link = document.getElementById('cta_btn_link').value;
                previewText = `CTA: ${content.title} (${content.btn_text})`;
            }

            activeEditElement.querySelector('.section-preview').innerHTML = previewText;
            activeEditElement.querySelector('.section-content-data').value = JSON.stringify(content);
            bootstrap.Modal.getInstance(document.getElementById('sectionEditModal')).hide();
        }

        async function saveSections() {
            const items = document.querySelectorAll('.section-item');
            const sections = [];

            items.forEach(item => {
                sections.push({
                    id: item.dataset.id || null,
                    type: item.dataset.type,
                    content: JSON.parse(item.querySelector('.section-content-data').value)
                });
            });

            try {
                const response = await fetch(`{{ route('admin.pages.sections.sync', $page) }}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': '{{ csrf_token() }}'
                    },
                    body: JSON.stringify({ sections })
                });

                const result = await response.json();
                if(result.success) {
                    alert('Page sections saved successfully!');
                    window.location.reload(); // Reload to get fresh IDs for new sections
                } else {
                    alert('Failed to save sections.');
                }
            } catch (error) {
                console.error('Error saving sections:', error);
                alert('An error occurred while saving.');
            }
        }
    </script>
    @endpush
</x-layouts.backend>
