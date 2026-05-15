<?php

namespace App\Http\Controllers\Backend;

use App\Http\Controllers\Controller;
use App\Models\Page;
use App\Models\Section;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class PageController extends Controller
{
    public function index()
    {
        $pages = Page::latest()->paginate(15);
        return view('backend.pages.index', compact('pages'));
    }

    public function create()
    {
        return view('backend.pages.create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:pages,slug',
        ]);

        $page = Page::create([
            'title' => $request->title,
            'slug' => $request->slug ?: Str::slug($request->title),
            'content' => $request->content,
            'meta_title' => $request->meta_title,
            'meta_description' => $request->meta_description,
            'meta_keywords' => $request->meta_keywords,
            'schema_markup' => $request->schema_markup,
            'status' => $request->status ?? 1,
        ]);

        return redirect()->route('admin.pages.edit', $page)->with('success', 'Page created. Now you can add sections.');
    }

    public function edit(Page $page)
    {
        $page->load('sections');
        return view('backend.pages.edit', compact('page'));
    }

    public function update(Request $request, Page $page)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:pages,slug,' . $page->id,
        ]);

        $page->update([
            'title' => $request->title,
            'slug' => $request->slug ?: Str::slug($request->title),
            'content' => $request->content,
            'meta_title' => $request->meta_title,
            'meta_description' => $request->meta_description,
            'meta_keywords' => $request->meta_keywords,
            'schema_markup' => $request->schema_markup,
            'status' => $request->status ?? 1,
        ]);

        return redirect()->back()->with('success', 'Page settings updated.');
    }

    public function syncSections(Request $request, Page $page)
    {
        $sections = $request->input('sections', []);
        
        // Keep track of existing section IDs to delete the ones not in the request
        $existingIds = $page->sections->pluck('id')->toArray();
        $incomingIds = [];

        foreach ($sections as $index => $sectionData) {
            if (isset($sectionData['id']) && in_array($sectionData['id'], $existingIds)) {
                $section = Section::find($sectionData['id']);
                $section->update([
                    'type' => $sectionData['type'],
                    'content' => $sectionData['content'],
                    'sort_order' => $index,
                ]);
                $incomingIds[] = $section->id;
            } else {
                $section = $page->sections()->create([
                    'type' => $sectionData['type'],
                    'content' => $sectionData['content'],
                    'sort_order' => $index,
                ]);
                $incomingIds[] = $section->id;
            }
        }

        // Delete sections not in incoming request
        $page->sections()->whereNotIn('id', $incomingIds)->delete();

        return response()->json(['success' => true, 'message' => 'Sections synchronized successfully.']);
    }

    public function destroy(Page $page)
    {
        $page->sections()->delete();
        $page->delete();
        return redirect()->route('admin.pages.index')->with('success', 'Page deleted successfully.');
    }
}
