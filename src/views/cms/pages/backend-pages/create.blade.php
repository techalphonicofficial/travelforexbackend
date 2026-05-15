<x-layouts.backend title="Create Page">
    <div class="mb-4">
        <a href="{{ route('admin.pages.index') }}" class="btn btn-link text-decoration-none p-0 mb-2 text-muted">
            <i class="bi bi-arrow-left me-1"></i>Back to Pages
        </a>
        <h4 class="fw-bold mb-0">Create New Page</h4>
    </div>

    <div class="row">
        <div class="col-lg-8">
            <div class="card border-0 shadow-sm">
                <div class="card-body p-4">
                    <form action="{{ route('admin.pages.store') }}" method="POST">
                        @csrf
                        <div class="mb-3">
                            <label class="form-label fw-semibold">Page Title</label>
                            <input type="text" name="title" class="form-control @error('title') is-invalid @enderror" value="{{ old('title') }}" required placeholder="e.g. About Us">
                            @error('title') <div class="invalid-feedback">{{ $message }}</div> @enderror
                        </div>

                        <div class="mb-3">
                            <label class="form-label fw-semibold">Slug (Optional)</label>
                            <input type="text" name="slug" class="form-control @error('slug') is-invalid @enderror" value="{{ old('slug') }}" placeholder="Auto-generated if empty">
                            @error('slug') <div class="invalid-feedback">{{ $message }}</div> @enderror
                        </div>

                        <div class="mb-3">
                            <label class="form-label fw-semibold">Short Description / SEO Desc</label>
                            <textarea name="meta_description" class="form-control" rows="3">{{ old('meta_description') }}</textarea>
                        </div>

                        <div class="form-check form-switch mb-4">
                            <input type="hidden" name="status" value="0">
                            <input class="form-check-input" type="checkbox" name="status" id="statusSwitch" value="1" checked>
                            <label class="form-check-label fw-semibold" for="statusSwitch">Active Status</label>
                        </div>

                        <div class="d-grid">
                            <button type="submit" class="btn btn-primary btn-lg">Create Page & Start Building</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</x-layouts.backend>
