@extends('frontend.layouts.app')

@section('title', $page->title )
@section('meta_description', $page->meta_description )
@section('meta_keywords', $page->meta_keywords)

@section('schema_markup')
    @if(!empty($page->schema_markup))
            {!! $page->schema_markup !!}
    @endif
@endsection

@section('content')
    <!-- Page Header (Default for all static pages) -->
    <section class="py-5 bg-black border-bottom text-center"
        @if (!empty($banner) && !empty($banner->image_path)) style="background-image: url('{{ asset('storage/' . $banner->image_path) }}'); background-size: cover; background-position: center;" @endif>
        <div class="container py-4">

            <h1 class="display-4 fw-bold text-white">{{ $page->title }}</h1>
            @if ($page->meta_description)
                <p class="lead text-white mb-0">{{ $page->meta_description }}</p>
            @endif
        </div>
    </section>

    <!-- Dynamic Sections -->
    <div class="page-sections">
        @foreach ($page->sections as $section)
            <div
                class="section-wrapper py-5 {{ $loop->even ? 'bg-light' : 'bg-white' }} section-type-{{ str_replace('_', '-', $section->type) }}">
                <div class="container">

                    @if ($section->type === 'rich_text')
                        <div class="rich-text-content prose text-dark">
                            {!! $section->content['body'] ?? '' !!}
                        </div>
                    @elseif($section->type === 'image_text')
                        <div class="row align-items-center g-5">
                            <div
                                class="col-lg-6 {{ ($section->content['side'] ?? 'left') === 'right' ? 'order-lg-2' : '' }}">
                                @if (!empty($section->content['image_url']))
                                    @php
                                        $url = $section->content['image_url'];
                                        $isFullUrl = Str::startsWith($url, ['http://', 'https://', '/']);
                                        $finalUrl = $isFullUrl ? $url : asset('storage/' . $url);
                                    @endphp
                                    <img src="{{ $finalUrl }}" alt="{{ $section->content['title'] ?? $page->title }}"
                                        class="img-fluid rounded-4 shadow-lg w-100">
                                @else
                                    <div class="rounded-4 bg-secondary bg-opacity-10 d-flex align-items-center justify-content-center"
                                        style="height: 400px;">
                                        <i class="bi bi-image fs-1 text-muted"></i>
                                    </div>
                                @endif
                            </div>
                            <div
                                class="col-lg-6 {{ ($section->content['side'] ?? 'left') === 'right' ? 'order-lg-1' : '' }}">
                                @if (!empty($section->content['title']))
                                    <h2 class="display-6 fw-bold mb-4">{{ $section->content['title'] }}</h2>
                                @endif
                                <div class="rich-text-content">
                                    {!! $section->content['body'] ?? '' !!}
                                </div>
                            </div>
                        </div>
                    @elseif($section->type === 'faq_accordion')
                        <div class="row justify-content-center">
                            <div class="col-lg-12">
                                <div class="accordion accordion-flush shadow-sm rounded-4 overflow-hidden border"
                                    id="accordion-{{ $section->id }}">
                                    @php $faqs = $section->content['faqs'] ?? []; @endphp
                                    @foreach ($faqs as $index => $item)
                                        <div class="accordion-item">
                                            <h2 class="accordion-header">
                                                <button
                                                    class="accordion-button fw-bold py-3 px-4 {{ $index !== 0 ? 'collapsed' : '' }}"
                                                    type="button" data-bs-toggle="collapse"
                                                    data-bs-target="#panel-{{ $section->id }}-{{ $index }}">
                                                    {{ $item['q'] }}
                                                </button>
                                            </h2>
                                            <div id="panel-{{ $section->id }}-{{ $index }}"
                                                class="accordion-collapse collapse {{ $index === 0 ? 'show' : '' }}">
                                                <div class="accordion-body p-4 text-muted">
                                                    {{ $item['a'] }}
                                                </div>
                                            </div>
                                        </div>
                                    @endforeach
                                </div>
                            </div>
                        </div>
                    @elseif($section->type === 'stats_bar')
                        <div class="row g-4 justify-content-center">
                            @php $stats = $section->content['stats'] ?? []; @endphp
                            @foreach($stats as $stat)
                                <div class="col-6 col-md-3 text-center">
                                    <h3 class="display-5 fw-bold text-primary mb-1">{{ $stat['value'] }}</h3>
                                    <p class="text-uppercase small fw-bold tracking-wider text-muted mb-0">{{ $stat['label'] }}</p>
                                </div>
                            @endforeach
                        </div>
                    @elseif($section->type === 'feature_grid')
                        @if(!empty($section->content['headline']))
                            <div class="text-center mb-5">
                                <h2 class="fw-bold display-6">{{ $section->content['headline'] }}</h2>
                                <div class="mx-auto bg-primary mt-3" style="width: 50px; height: 3px;"></div>
                            </div>
                        @endif
                        <div class="row g-4">
                            @php $features = $section->content['features'] ?? []; @endphp
                            @foreach($features as $feat)
                                <div class="col-md-4">
                                    <div class="card border-0 bg-white h-100 p-4 text-center transition hover-lift">
                                        <div class="feature-icon mb-4">
                                            <i class="bi {{ $feat['icon'] ?? 'bi-gem' }} fs-1 text-primary"></i>
                                        </div>
                                        <h4 class="fw-bold mb-3">{{ $feat['title'] }}</h4>
                                        <p class="text-muted small mb-0">{{ $feat['desc'] }}</p>
                                    </div>
                                </div>
                            @endforeach
                        </div>
                    @elseif($section->type === 'testimonial_grid')
                        <div class="row g-4">
                            @php $testimonials = $section->content['testimonials'] ?? []; @endphp
                            @foreach($testimonials as $t)
                                <div class="col-md-4">
                                    <div class="testimonial-card p-4 h-100 border rounded-4 bg-white shadow-sm">
                                        <div class="text-warning mb-3">
                                            <i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i><i class="bi bi-star-fill"></i>
                                        </div>
                                        <p class="text-muted font-italic mb-4">"{{ $t['text'] }}"</p>
                                        <div class="d-flex align-items-center gap-3">
                                            <div class="flex-shrink-0 bg-primary-subtle text-primary rounded-circle d-flex align-items-center justify-content-center fw-bold" style="width: 40px; height: 40px;">
                                                {{ strtoupper(substr($t['name'], 0, 1)) }}
                                            </div>
                                            <div>
                                                <h6 class="fw-bold mb-0">{{ $t['name'] }}</h6>
                                                <small class="text-muted">{{ $t['title'] }}</small>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            @endforeach
                        </div>
                    @elseif($section->type === 'timeline')
                        @if(!empty($section->content['headline']))
                            <div class="text-center mb-5">
                                <h2 class="fw-bold display-6">{{ $section->content['headline'] }}</h2>
                                <div class="mx-auto bg-primary mt-3" style="width: 50px; height: 3px;"></div>
                            </div>
                        @endif
                        <div class="timeline-container position-relative">
                            <div class="timeline-line position-absolute start-50 translate-middle-x h-100 bg-secondary opacity-25" style="width: 2px;"></div>
                            @php $items = $section->content['items'] ?? []; @endphp
                            @foreach($items as $index => $item)
                                <div class="row g-0 mb-5 timeline-row {{ $index % 2 === 0 ? '' : 'flex-row-reverse' }}">
                                    <div class="col-md-5 {{ $index % 2 === 0 ? 'text-md-end' : '' }} px-4">
                                        <div class="timeline-content p-4 rounded-4 bg-white shadow-sm border border-primary-subtle">
                                            <span class="badge bg-primary mb-2">{{ $item['year'] }}</span>
                                            <h5 class="fw-bold mb-2">{{ $item['title'] }}</h5>
                                            <p class="text-muted small mb-0">{{ $item['desc'] }}</p>
                                        </div>
                                    </div>
                                    <div class="col-md-2 d-none d-md-flex justify-content-center align-items-center">
                                        <div class="timeline-dot bg-primary rounded-circle shadow" style="width: 20px; height: 20px; z-index: 1;"></div>
                                    </div>
                                    <div class="col-md-5 px-4 d-none d-md-block"></div>
                                </div>
                            @endforeach
                        </div>
                    @elseif($section->type === 'video_block')
                        <div class="video-section position-relative rounded-4 overflow-hidden shadow-lg" style="height: 500px;">
                            @if(!empty($section->content['cover_url']))
                                <img src="{{ $section->content['cover_url'] }}" class="position-absolute w-100 h-100 object-fit-cover" alt="Video Cover">
                            @endif
                            <div class="position-absolute w-100 h-100 bg-dark opacity-50"></div>
                            <div class="position-relative h-100 d-flex flex-column align-items-center justify-content-center text-center p-4">
                                @if(!empty($section->content['title']))
                                    <h2 class="display-5 fw-bold text-white mb-4">{{ $section->content['title'] }}</h2>
                                @endif
                                <a href="{{ $section->content['video_url'] ?? '#' }}" class="btn btn-white btn-lg rounded-circle shadow-lg d-flex align-items-center justify-content-center pulse-animation" style="width: 80px; height: 80px;" target="_blank">
                                    <i class="bi bi-play-fill fs-2"></i>
                                </a>
                            </div>
                        </div>
                    @elseif($section->type === 'cta_banner')
                        <div class="cta-block text-white p-5 rounded-4 shadow-lg text-center" style="background-color: #4b5563">
                            <h2 class="display-5 fw-bold mb-3">{{ $section->content['title'] ?? 'Ready to get started?' }}
                            </h2>
                            <p class="lead mb-4 opacity-75">Join thousands of satisfied customers today and experience the
                                difference.</p>
                            <a href="{{ $section->content['btn_link'] ?? '#' }}"
                                class="btn btn-light btn-lg rounded-pill px-5 fw-bold shadow-sm transition">
                                {{ $section->content['btn_text'] ?? 'Learn More' }}
                            </a>
                        </div>
                    @endif

                </div>
            </div>
        @endforeach
    </div>
@endsection

@push('styles')
    <style>
        .rich-text-content h2,
        .rich-text-content h3 {
            font-weight: 700;
            margin-top: 1.5rem;
            margin-bottom: 1rem;
        }

        .rich-text-content p {
            margin-bottom: 1.25rem;
            line-height: 1.8;
            color: #4b5563;
        }

        .rich-text-content ul,
        .rich-text-content ol {
            margin-bottom: 1.25rem;
            padding-left: 1.5rem;
        }

        .rich-text-content li {
            margin-bottom: 0.5rem;
        }

        .section-type-faq-accordion .accordion-button:not(.collapsed) {
            /* background-color: var(--bs-primary-bg-subtle); */
            /* color: var(--bs-primary); */
        }

        .section-type-cta-banner {
            padding: 4rem 0;
        }

        .hover-lift {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .hover-lift:hover {
            transform: translateY(-10px);
            box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1) !important;
        }

        .section-type-feature-grid .feature-icon {
            width: 80px;
            height: 80px;
            background-color: var(--bs-primary-bg-subtle);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto;
        }

        .pulse-animation {
            animation: pulse 2s infinite;
            background-color: white !important;
            color: var(--bs-primary) !important;
        }

        @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.4); }
            70% { box-shadow: 0 0 0 20px rgba(255, 255, 255, 0); }
            100% { box-shadow: 0 0 0 0 rgba(255, 255, 255, 0); }
        }

        .timeline-row {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.6s ease-out;
        }

        .timeline-row.visible {
            opacity: 1;
            transform: translateY(0);
        }

        .transition {
            transition: all 0.3s ease;
        }

        .transition:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
        }
    </style>
    
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                    }
                });
            }, { threshold: 0.1 });

            document.querySelectorAll('.timeline-row').forEach(row => {
                observer.observe(row);
            });
        });
    </script>
@endpush
