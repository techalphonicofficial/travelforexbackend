<x-layouts.backend title="Pages">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
            <h4 class="mb-1 text-body-emphasis fw-bold">Pages</h4>
            <p class="text-muted small mb-0">Manage your static pages (About Us, Privacy Policy, etc.).</p>
        </div>
        <div>
            <a href="{{ route('admin.pages.create') }}" class="btn btn-primary shadow-sm">
                <i class="bi bi-plus-lg me-2"></i>Create New Page
            </a>
        </div>
    </div>

    <div class="card border-0 shadow-sm">
        <div class="card-body p-0">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="bg-light">
                        <tr>
                            <th class="ps-4">Title</th>
                            <th>Slug</th>
                            <th>Sections</th>
                            <th>Status</th>
                            <th>Last Updated</th>
                            <th class="text-end pe-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        @forelse($pages as $page)
                            <tr>
                                <td class="ps-4">
                                    <h6 class="mb-0 fw-bold">{{ $page->title }}</h6>
                                </td>
                                <td><code>/{{ $page->slug }}</code></td>
                                <td><span class="badge bg-info-subtle text-info">{{ $page->sections_count ?? $page->sections->count() }} Sections</span></td>
                                <td>
                                    @if($page->status)
                                        <span class="badge bg-success-subtle text-success">Active</span>
                                    @else
                                        <span class="badge bg-danger-subtle text-danger">Inactive</span>
                                    @endif
                                </td>
                                <td>{{ $page->updated_at->diffForHumans() }}</td>
                                <td class="text-end pe-4">
                                    <div class="btn-group">
                                        <a href="{{ route('admin.pages.edit', $page) }}" class="btn btn-sm btn-outline-primary"><i class="bi bi-pencil"></i></a>
                                        <form action="{{ route('admin.pages.destroy', $page) }}" method="POST" onsubmit="return confirm('Are you sure?')">
                                            @csrf
                                            @method('DELETE')
                                            <button type="submit" class="btn btn-sm btn-outline-danger ms-1"><i class="bi bi-trash"></i></button>
                                        </form>
                                    </div>
                                </td>
                            </tr>
                        @empty
                            <tr>
                                <td colspan="6" class="text-center py-5">
                                    <p class="text-muted mb-0">No pages found.</p>
                                </td>
                            </tr>
                        @endforelse
                    </tbody>
                </table>
            </div>
            @if($pages->hasPages())
                <div class="p-4 border-top">
                    {{ $pages->links() }}
                </div>
            @endif
        </div>
    </div>
</x-layouts.backend>
