<?php
class Tag {
    public $id;
    public $name;
    
    public $passages = array();
    
    function addPassage($passage) {
        array_push($this->passages, $passage);
    }
}
?>

