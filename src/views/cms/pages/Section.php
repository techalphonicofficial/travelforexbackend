<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Section extends Model
{
    use HasFactory;

    protected $fillable = ['sectionable_id', 'sectionable_type', 'type', 'content', 'sort_order', 'status'];

    protected $casts = [
        'content' => 'json',
        'status' => 'boolean',
    ];

    public function sectionable()
    {
        return $this->morphTo();
    }
}
