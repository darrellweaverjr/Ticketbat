<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Input;
use App\Http\Models\Category;
use App\Http\Models\Band;

/**
 * Manage Bands
 *
 * @author ivan
 */
class BandController extends Controller{
    
    /**
     * List all bands and return default view.
     *
     * @return view
     */
    public function index()
    {
        try {
            //init
            $input = Input::all(); 
            if(isset($input) && isset($input['id']))
            {
                //get selected record
                $band = Band::find($input['id']);  
                if(!$band)
                    return ['success'=>false,'msg'=>'There was an error getting the band.<br>Maybe it is not longer in the system.'];
                $shows = [];
                foreach($band->show_bands as $s)
                    $shows[] = [$s->name,$s->pivot->n_order];
                $band->image_url = 'https://www.ticketbat.com'.$band->image_url; //$band->image_url = asset($band->image_url);
                return ['success'=>true,'band'=>array_merge($band->getAttributes(),['shows[]'=>$shows])];
            }
            else
            {
                //get all records        
                $bands = Band::orderBy('name')->get();
                $categories = Category::all();
                //return view
                return view('admin.bands.index',compact('bands','categories'));
            }
        } catch (Exception $ex) {
            throw new Exception('Error Bands Index: '.$ex->getMessage());
        }
    } 
    /**
     * Save new or updated band.
     *
     * @void
     */
    public function save()
    {
        try {
            //init
            $input = Input::all(); 
            //save all record      
            if($input)
            {
                if(isset($input['id']) && $input['id'])
                {
                    $band = Band::find($input['id']);
                }                    
                else
                {                    
                    $band = new Band;
                }
                //save band
                $band->category()->associate(Category::find($input['category_id']));
                $band->name = $input['name'];
                $band->short_description = $input['short_description'];
                $band->description = $input['description'];
                $band->youtube = $input['youtube'];
                $band->facebook = $input['facebook'];
                $band->twitter = $input['twitter'];
                $band->my_space = $input['my_space'];
                $band->flickr = $input['flickr'];
                $band->instagram = $input['instagram'];
                $band->soundcloud = $input['soundcloud'];
                $band->website = $input['website'];
                $band->set_image_url($input['image_url']);
                $band->save();
                //return
                return ['success'=>true,'msg'=>'Band saved successfully!'];
            }
            return ['success'=>false,'msg'=>'There was an error saving the band.<br>The server could not retrieve the data.'];
        } catch (Exception $ex) {
            throw new Exception('Error Bands Save: '.$ex->getMessage());
        }
    }
    /**
     * Remove bands.
     *
     * @void
     */
    public function remove()
    {
        try {
            //init
            $input = Input::all();
            //delete all records   
            if(Band::destroy($input['id']))
                return ['success'=>true,'msg'=>'All records deleted successfully!'];
            return ['success'=>false,'msg'=>'There was an error deleting the band(s)!<br>They might have some dependences.'];
        } catch (Exception $ex) {
            throw new Exception('Error Bands Remove: '.$ex->getMessage());
        }
    }
    /**
     * Search for social media in certain url given.
     *
     * @return Array with social media urls
     */
    public function load_social_media()
    {
        try {
            $input = Input::all(); 
            return Band::load_social_media($input['url']);
        } catch (Exception $ex) {
            throw new Exception('Error Bands Load Social Media: '.$ex->getMessage());
        }
    }
}