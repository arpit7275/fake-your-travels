function ff_add(image_url) {
  var data = { method: 'add', url: image_url };
  $('#your-photo span.searching').show();
  ff_post(data, ff_remove_bg);
}

function ff_get(image_json) {
  if (image_json.status == "success") {
    var data = { method: 'get', image_id: g_image_id };
    ff_post(data, display_image);
  }
}

function ff_remove_bg(image_json) {
  g_image_id = image_json.Image.id;
  var data = { method: 'remove_bg', image_id: g_image_id };

  ff_post(data, ff_get);
}

function display_image(image_data) {
  $('#your-photo span.searching').hide();
  $('#person').attr('src', 'data:image/png;base64,' + image_data);
  window.personImage = $('#person').attr('src')

  var image = new Image();
  image.onload = function() {
    setPersonImage(image, personGroup);
  }
  image.src = personImage;
}

function ff_post(data, callback) {
  var base_url = "assets/php/ff.php/";
  jQuery.post(base_url, data, callback, "json");
}

var featherEditor = new Aviary.Feather({
  apiKey: '1234567',
  apiVersion: 2,
  tools: ['enhance', 'effects', 'orientation', 'crop', 'sharpness', 'text'],
  onSave: function(imageID, newURL) {
    if (typeof backgroundImg != 'undefined') {
      var img = document.getElementById(imageID);
      img.src = newURL;
      if (imageID == "person") {
        person_proxy(newURL);
      }
      // } else if (imageID == 'preview') {
      //   $('#save').attr('data-fp-url', newURL);
      // }
    }
  }
});

function person_proxy(url) {
  jQuery.post("assets/php/image-proxy.php", {link: url}, update_person, "json");
}

function update_person(data_json) {
  personImage = "data:image/png;base64," + data_json;
  var image = new Image();
  image.onload = function() {
    personImg.setImage(image);
    layer.draw();
  }
  image.src = personImage;
}

function launchEditor(id, src) {
  featherEditor.launch({
    image: id,
    url: src
  });
  return false;
}

$(document).ready(function() {
  filepicker.setKey('AhyWohKMSG6uimWcifzE1z');

  $('#preview-wrapper #edit').click(function() {
    launchEditor('preview', $('#preview').attr('src'));
  })

  $('#person_filepicker').change(function() {
    var out = '';
    for(var i = 0; i < event.fpfiles.length; i++) {
      out += event.fpfiles[i].url;
      out += ' ';
    }
    ff_add(out);
  });
});