function update(activeAnchor) {
  var group = activeAnchor.getParent();

  var topLeft = group.get('.topLeft')[0];
  var topRight = group.get('.topRight')[0];
  var bottomRight = group.get('.bottomRight')[0];
  var bottomLeft = group.get('.bottomLeft')[0];
  var image = group.get('.image')[0];

  var anchorX = activeAnchor.getX();
  var anchorY = activeAnchor.getY();


  switch (activeAnchor.getName()) {
    case 'topLeft':
    topRight.setY(anchorY);
    bottomLeft.setX(anchorX);
    break;
    case 'topRight':
    topLeft.setY(anchorY);
    bottomRight.setX(anchorX);
    break;
    case 'bottomRight':
    bottomLeft.setY(anchorY);
    topRight.setX(anchorX);
    break;
    case 'bottomLeft':
    bottomRight.setY(anchorY);
    topLeft.setX(anchorX);
    break;
  }

  image.setPosition(topLeft.getPosition());

  var width = topRight.getX() - topLeft.getX();
  var height = bottomLeft.getY() - topLeft.getY();
  if(width && height) {
    image.setSize(width, height);
  }
}

function addAnchor(group, x, y, name) {
  var stage = group.getStage();
  var layer = group.getLayer();

  var anchor = new Kinetic.Circle({
    x: x,
    y: y,
    // stroke: '#666',
    // fill: '#ddd',
    // strokeWidth: 2,
    radius: 8,
    name: name,
    draggable: true,
    dragOnTop: false
  });

  anchor.on('dragmove', function() {
    update(this);
    layer.draw();
  });
  anchor.on('mousedown touchstart', function() {
    group.setDraggable(false);
    this.moveToTop();
  });
  anchor.on('dragend', function() {
    group.setDraggable(true);
    layer.draw();
  });

  // add hover styling
  anchor.on('mouseover', function() {
    var layer = this.getLayer();
    document.body.style.cursor = 'pointer';
    this.setStrokeWidth(4);
    layer.draw();
  });
  anchor.on('mouseout', function() {
    var layer = this.getLayer();
    document.body.style.cursor = 'default';
    this.setStrokeWidth(0);
    layer.draw();
  });

  group.add(anchor);
}

function loadImages(sources, callback) {
  var images = {};
  var loadedImages = 0;
  var numImages = 0;
  for(var src in sources) {
    numImages++;
  }
  for(var src in sources) {
    images[src] = new Image();
    images[src].onload = function() {
      if(++loadedImages >= numImages) {
        callback(images);
      }
    };
    images[src].src = sources[src];
  }
}

function initStage(images) {
  stage = new Kinetic.Stage({
    container: 'edit-fake',
    width: 600,
    height: 400
  });

  personGroup = new Kinetic.Group({
    x: 270,
    y: 100,
    draggable: true
  });

  backgroundGroup = new Kinetic.Group({
    x: 0,
    y: 0,
    draggable: false
  })
  layer = new Kinetic.Layer();

  /*
   * go ahead and add the groups
   * to the layer and the layer to the
   * stage so that the groups have knowledge
   * of its layer and stage
   */
  layer.add(backgroundGroup);
  layer.add(personGroup);
  stage.add(layer);

  stage.draw();
}

function setBackgroundImage(image, backgroundGroup) {
  bgImg = new Kinetic.Image({
    x: 0,
    y: 0,
    image: image,
  })

  backgroundGroup.add(bgImg);
  var bgRatio = bgImg.getWidth() / bgImg.getHeight();
  bgImg.setHeight(400);
  bgImg.setWidth(400 * bgRatio);
  bgImg.setPosition({x: (600 - bgImg.getWidth()) / 2, y: 0});
  backgroundGroup.getLayer().draw();
}

function setPersonImage(image, personGroup) {
  personImg = new Kinetic.Image({
    x: 0,
    y: 0,
    image: image,
    name: 'image'
  });
  var personRatio = personImg.getWidth() / personImg.getHeight();
  personImg.setHeight(200);
  personImg.setWidth(200 * personRatio);

  personGroup.add(personImg);
  addAnchor(personGroup, 0, 0, 'topLeft');
  addAnchor(personGroup, personImg.getWidth(), 0, 'topRight');
  addAnchor(personGroup, personImg.getWidth(), personImg.getHeight(), 'bottomRight');
  addAnchor(personGroup, 0, personImg.getHeight(), 'bottomLeft');

  personGroup.on('dragstart', function() {
    this.moveToTop();
  });

  personImg.on('dblclick', function() {
    launchEditor('person', $('img#person').attr('src'));
  })

  personGroup.getLayer().draw();
}

var sources = {
  person: $('#person').attr('src'),
};

function save_to_data_url() {
  var data_url = $('#edit-fake div canvas')[0].toDataURL();
  return data_url;
}

function preview() {
  var data_url = save_to_data_url();
  $('#preview').attr('src', data_url);
  $('#preview-wrapper').modal();
  // $('#save').attr('b64', data_url);
  // $('#save').attr('b64', toB64(data_url));
}

function toB64(durl) {
  return durl.slice(22);
}

function clearCanvas() {
  $('#edit-fake div').remove();
}

function refresh_canvas() {
  var sources = {
    person: personImg,
    background: backgroundImg
  };

  clearCanvas();
  loadImages(sources, initStage);
}


$(document).ready(function() {
  $('#go-real-btn').click(function() {
    $('#edit-canvas .searching').show();
    $.ajax({
      url: '/wish-you-were-here/download.php',
      data: { image_id: '107232053' },
      type: 'post',
      success: function(result) {
        $('#edit-canvas .searching').hide();
        window.backgroundImg = result.url;
        bg_proxy(backgroundImg);

        // Switch go real btn to preview btn
        $('#preview-btn').show();
        $('#go-real-btn').hide();
      },
      error: function(error) {
        console.log(error);
      }
    })
  });

  $('#preview-btn').click(function() {
    preview();
  })

  $('#save').click(function() {
    filepicker.storeUrl(
      $('#preview').attr('src'),
      {filename: 'travels'},
      function(filio){
        filepicker.exportFile(filio, {mimetype: 'image/png', services: ['FACEBOOK', 'DROPBOX', 'COMPUTER']}, function(filio) {
          console.log(JSON.stringify(filio));
        });
      });
  });
})
