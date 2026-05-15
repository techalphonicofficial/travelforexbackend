<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Page extends Model
{
    use HasFactory;

    protected $fillable = [
        'title', 'slug', 'content', 'meta_title', 'meta_description','schema_markup',
        'meta_keywords', 'status'
    ];

    public function sections()
    {
        return $this->morphMany(Section::class, 'sectionable')->orderBy('sort_order');
    }

    public function scopeActive($query, $param1 = null){
     return $query->where('status',1);
    }
}
