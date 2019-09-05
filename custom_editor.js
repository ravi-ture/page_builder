var indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

(function($) {
  $.editor = function(element, options) {
    var $element, editor;
    this.defaults = {
      debug: false,
      defaultImageSrc: '/assets/add_image.png',
      buttons: ['division', 'image', 'text', 'saveButton', 'exportJson', 'importJson', 'backgroundColor', 'borderOptions'],
      keepDragHandler: true,
      saveParamName: 'elements',
      saveUrl: '',
      deleteOptions: ['delete_icon', 'delete_key', 'delete_area']
    };
    this.settings = {};
    editor = this;
    $element = $(element);
    this.element_count = 0;
    this.getElementCount = function() {
      return this.element_count;
    };
    this.htmlStrings = {
      dialogBoxes: {
        displayJson: "<div class='displayJsonDiv' title='Element JSON'><p class='exportedJson'></p></div>",
        importJson: "<div class='importJsonDiv' title='Import Elements'><form class='importJson'><label for='json_input'> Please paste json :<input type='text' name='json_input' id='json_input'/><p>Note: JSON should be exproted one with the same editor.</form></div>"
      },
      elementContainer: "<div class='draggableContainer'><div id='' class = 'elementContainer'></div></div>",
      elements: {
        divisionElement: "<div id='' class='divisionElement element'></div>",
        imageElement: "<img  id='' class='imageElement element' src='' width='50px' height='50px'/>",
        textElement: "<div id='' class='textElement element' style='text-align:center;' contenteditable='true'>Edit me </div>"
      },
      handlers: {
        draggHandler: "<span class='draggHandle handler'>dragg me</span>",
        resizeHandlers: "<span class='ui-resizable-handle handler ui-resizable-e' title='Resize this element'></span><span class='ui-resizable-handle handler ui-resizable-w' title='Resize this element' ></span><span class='ui-resizable-handle handler ui-resizable-n' title='Resize this element'></span><span class='ui-resizable-handle handler ui-resizable-s' title='Resize this element' ></span><span class='ui-resizable-handle handler ui-resizable-ne' title='Resize this element' ></span><span class='ui-resizable-handle handler ui-resizable-se' title='Resize this element' ></span><span class='ui-resizable-handle handler ui-resizable-sw' title='Resize this element' ></span><span class='ui-resizable-handle handler ui-resizable-nw' title='Resize this element'></span>",
        rotationHandler: "<span class='handler ui-rotatable-handle' draggable='true' title='Rotate this element'></span>",
        deletionHandler: "<span class='deletionHandler handler' title='Remove this element'></span>"
      },
      tools: {
        division: "<button class='toolbtn addDivElement'><img src='/assets/editorImages/plus.jpg'><span>Add Division</span></button>",
        image: "<button class='toolbtn addImgElement' ><img src='/assets/editorImages/addImage.jpg'><span>Add Image</span></button>",
        text: "<button class='toolbtn addTextElement' ><img src='/assets/editorImages/addText.jpg'><span>Add Text</span></button>",
        backgroundColor: "<div id='colorPicker' class='toolbtn elementBackgroundPicker'><img src='/assets/editorImages/paint.jpg'><span>Set Color</span></div>",
        saveButton: "<button class='toolbtn saveElements'>Save</button>",
        exportJson: "<button class='toolbtn exportElements' ><img src='/assets/editorImages/export.jpg'><span>Export JSON</span></button>",
        importJson: "<button class='toolbtn importElements' ><img src='/assets/editorImages/import.jpg'><span>Import JSON</span></button>",
        droppableButton: "<div class='toolbtn deleteElements' id='droppable' title='Drag Elements here to remove them.'><img src='/assets/editorImages/deleteElement.png'></div>",
        borderOptions: "<div id='colorPicker' class='toolbtn elementBorderOptions'></div>"
      }
    };
    this.init = function() {
      this.settings = $.extend({}, this.defaults, options);
      $element.wrap("<div class='editorContainerWrapper'></div>");
      this.appendToolbar();
      this.appendDialogBoxes();
      if (this.ckeditorExists()) {
        CKEDITOR.disableAutoInline = true;
      }
      if (indexOf.call(this.settings.deleteOptions, 'delete_key') >= 0) {
        return $(window).keydown(function(e) {
          if (e.keyCode === 46 && !$('.cke_focus').length) {
            return $element.find('.selected-element').fadeOut({
              complete: function() {
                return $(this).remove();
              }
            });
          }
        });
      }
    };
    this.appendDialogBoxes = function() {
      $element.after(this.htmlStrings.dialogBoxes.displayJson);
      return $element.after(this.htmlStrings.dialogBoxes.importJson);
    };
    this.appendToolbar = function() {
      var toolbar;
      toolbar = this.prepareToolbar();
      $element.css('position', 'relative');
      toolbar.offset($element.position());
      if (toolbar) {
        return $element.before(toolbar);
      }
    };
    this.ckeditorExists = function() {
      return typeof CKEDITOR !== 'undefined';
    };
    this.prepareToolbar = function() {
      var toolbar;
      this.log('Loading toolbar');
      toolbar = $('<div class = "toolbar"></div>');
      if (indexOf.call(this.settings.deleteOptions, 'delete_area') >= 0) {
        this.settings.buttons.push('droppableButton');
      }
      $.each(this.settings.buttons, function(index, buttonName) {
        if (editor.htmlStrings.tools.hasOwnProperty(buttonName)) {
          element = $(editor.htmlStrings.tools[buttonName]);
          toolbar.append(element);
          return editor.addElementEvents(element, buttonName);
        } else {
          return editor.log("\t invalid option " + buttonName + " for toolbar buttons");
        }
      });
      return toolbar;
    };
    this.append_color_pallete = function(colorPicker) {
      var color, colorPallet, i, j, k, l, ref, results;
      colorPicker.append("<div class='colorPalletContainer'></div>");
      colorPallet = colorPicker.find('.colorPalletContainer');
      results = [];
      for (i = l = 15, ref = 0 - 5; l >= 0; i = l += ref) {
        results.push((function() {
          var m, ref1, results1;
          results1 = [];
          for (j = m = 15, ref1 = 0 - 5; m >= 0; j = m += ref1) {
            results1.push((function() {
              var n, ref2, results2;
              results2 = [];
              for (k = n = 15, ref2 = 0 - 5; n >= 0; k = n += ref2) {
                color = "#" + (i.toString(16)) + (j.toString(16)) + (k.toString(16));
                results2.push(colorPallet.append("<div class= 'colorPalletIcon' style='background-color: " + color + ";'></div>"));
              }
              return results2;
            })());
          }
          return results1;
        })());
      }
      return results;
    };
    this.append_border_option_pallete = function(borderDiv) {
      var borderPallet, i, l, len, ref, results;
      borderDiv.append("<div class='borderOptionsContainer'></div>");
      borderPallet = borderDiv.find('.borderOptionsContainer');
      borderPallet.append('<hr>');
      ref = ['inset', 'outset', 'dotted', 'ridge', 'solid', 'none'];
      results = [];
      for (l = 0, len = ref.length; l < len; l++) {
        i = ref[l];
        results.push(borderPallet.append("<div class='borderPalletIcon borderStyleIcon borderStyle" + i + "' data-border-style='" + i + "' style='border-style:" + i + ";'></div>"));
      }
      return results;
    };
    this.addElementEvents = function(element, elementType) {
      switch (elementType) {
        case 'division':
          return this.toolbarButtonEvents.addDivisionEvents(element);
        case 'image':
          return this.toolbarButtonEvents.addImageEvents(element);
        case 'text':
          return this.toolbarButtonEvents.addTextEvents(element);
        case 'backgroundColor':
          return this.toolbarButtonEvents.addBackgroundColorEvents(element);
        case 'saveButton':
          return this.toolbarButtonEvents.addSaveElementsEvent(element);
        case 'exportJson':
          return this.toolbarButtonEvents.addExportToJsonEvent(element);
        case 'droppableButton':
          return this.toolbarButtonEvents.addDroppableEvent(element);
        case 'borderOptions':
          return this.toolbarButtonEvents.addBackgroundOptions(element);
        case 'importJson':
          return this.toolbarButtonEvents.addImportFromJsonEvent(element);
        default:
          return this.log("\t invalid element type " + elementType + " countered while binding events to tool.");
      }
    };
    this.addCommonElementEvents = function(element) {
      return element.mousedown(function() {
        $element.find('.selected-element').removeClass('selected-element');
        return $(this).addClass('selected-element');
      });
    };
    this.selected_element = function() {
      var selectedElement;
      selectedElement = $element.find('.selected-element');
      if (selectedElement.length) {
        return selectedElement;
      } else {
        return null;
      }
    };
    this.select_element = function(element) {
      $element.find('.selected-element').removeClass('selected-element');
      return element.addClass('selected-element');
    };
    this.toolbarButtonEvents = {
      addDivisionEvents: function(divisionButton) {
        return divisionButton.on('click', editor.elementInsertion.addDivisionElement);
      },
      addImageEvents: function(imageButton) {
        return imageButton.on('click', editor.elementInsertion.addImageElement);
      },
      addTextEvents: function(textButton) {
        return textButton.on('click', editor.elementInsertion.addTextElement);
      },
      addBackgroundColorEvents: function(colorPicker) {
        editor.append_color_pallete(colorPicker);
        colorPicker.on('click', function() {
          return $(this).find('.colorPalletContainer').slideToggle();
        });
        return colorPicker.find('.colorPalletIcon').on('click', function() {
          var selected_element;
          selected_element = editor.selected_element();
          if (selected_element && !selected_element.find('.imageElement').length) {
            return selected_element.find('.elementContainer').css('background-color', $(this).css('background-color'));
          }
        });
      },
      addSaveElementsEvent: function(element) {
        return element.on('click', editor.saveElements);
      },
      addExportToJsonEvent: function(element) {
        return element.on('click', editor["export"].displayElementJson);
      },
      addImportFromJsonEvent: function(element) {
        return element.on('click', editor["import"].getJSONString);
      },
      addDroppableEvent: function(element) {
        return $(element).droppable({
          tolerance: 'pointer',
          drop: function(event, ui) {
            return ui.draggable.fadeOut({
              complete: function() {
                return $(this).remove();
              }
            });
          }
        });
      },
      addBackgroundOptions: function(borderOptionsTool) {
        editor.append_color_pallete(borderOptionsTool);
        editor.append_border_option_pallete(borderOptionsTool);
        borderOptionsTool.on('click', function() {
          return $(this).find('.borderOptionsContainer, .colorPalletContainer').slideToggle();
        });
        borderOptionsTool.find('.colorPalletIcon').on('click', function() {
          var selected_element;
          selected_element = editor.selected_element();
          if (selected_element && !selected_element.find('.imageElement').length) {
            return selected_element.find('.elementContainer').css('border-color', $(this).css('background-color'));
          }
        });
        return borderOptionsTool.find('.borderPalletIcon').on('click', function() {
          var borderStyle, selected_element;
          selected_element = editor.selected_element();
          if (selected_element && !selected_element.find('.imageElement').length) {
            borderStyle = $(this).css(['border-top-style', 'border-bottom-style', 'border-right-style', 'border-left-style']);
            return selected_element.find('.elementContainer').css(borderStyle);
          }
        });
      }
    };
    this.makeElementDraggableRotatableAndResizable = function(element) {
      this.elementCreation.addHandlers(element);
      element.resizable({
        handles: {
          n: element.find('span.ui-resizable-n'),
          e: element.find('span.ui-resizable-e'),
          w: element.find('span.ui-resizable-w'),
          s: element.find('span.ui-resizable-s'),
          ne: element.find('span.ui-resizable-ne'),
          se: element.find('span.ui-resizable-se'),
          sw: element.find('span.ui-resizable-sw'),
          nw: element.find('span.ui-resizable-nw')
        }
      }).rotatable({
        handle: element.find('span.ui-rotatable-handle')
      });
      return element.parent('.draggableContainer').draggable({
        handle: editor.settings.keepDragHandler ? '.draggHandle' : null
      });
    };
    this.elementInsertion = {
      addDivisionElement: function() {
        element = editor.elementCreation.createDivisionElement();
        $element.append(element);
        editor.addCommonElementEvents(element);
        return editor.select_element(element);
      },
      addImageElement: function() {
        element = editor.elementCreation.createImageElement();
        $element.append(element);
        editor.addCommonElementEvents(element);
        return editor.select_element(element);
      },
      addTextElement: function() {
        var textElement;
        element = editor.elementCreation.createTextElement();
        textElement = $(element).find('.textElement');
        $element.append(element);
        editor.addCommonElementEvents(element);
        editor.select_element(element);
        return editor.elementInsertion.addCKEditorsEvents(textElement);
      },
      addCKEditorsEvents: function(textElement) {
        var ckInstance;
        if (!editor.ckeditorExists()) {
          return;
        }
        $(textElement).dblclick(function() {
          if ($(this).attr('contenteditable') !== true) {
            $(this).attr('contenteditable', true);
            $(this).parents('.elementContainer:first').resizable('disable');
            $(this).parents('.draggableContainer:first').draggable('disable');
            return $(this).focus();
          }
        });
        ckInstance = CKEDITOR.inline(textElement[0].id, {
          toolbar: [
            {
              name: 'basicstyles',
              groups: ['basicstyles'],
              items: ['Bold', 'Italic', 'Underline', 'Strike']
            }, {
              name: 'paragraph',
              groups: ['list', 'indent', 'blocks', 'align'],
              items: ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock']
            }, {
              name: 'colors',
              items: ['TextColor', 'BGColor']
            }, {
              name: 'styles',
              items: ['FontSize']
            }
          ]
        });
        return ckInstance.on('blur', function(event) {
          textElement = $(event.editor.element.$);
          textElement.parents('.draggableContainer:first').draggable('enable');
          textElement.parents('.elementContainer:first').resizable('enable');
          return $(this).attr('contenteditable', false);
        });
      }
    };
    this.elementCreation = {
      getHandlerString: function() {
        return [editor.htmlStrings.handlers.resizeHandlers, editor.htmlStrings.handlers.rotationHandler, (indexOf.call(editor.settings.deleteOptions, 'delete_icon') >= 0 ? editor.htmlStrings.handlers.deletionHandler : ''), (editor.settings.keepDragHandler ? editor.htmlStrings.handlers.draggHandler : '')].join('');
      },
      addHandlers: function(element) {
        var handlers;
        handlers = $(this.getHandlerString());
        handlers.filter('.handler').attr({
          id: "elementhandler_" + editor.element_count
        });
        if (indexOf.call(editor.settings.deleteOptions, 'delete_icon') >= 0) {
          handlers.filter('.deletionHandler.handler').on('click', editor.deleteElement);
        }
        return element.append(handlers);
      },
      createDivisionElement: function() {
        var container, division, elementContainer;
        container = $(editor.htmlStrings.elementContainer);
        elementContainer = container.find('.elementContainer');
        division = $(editor.htmlStrings.elements.divisionElement).attr({
          id: "divisionElement_" + editor.element_count
        });
        elementContainer.append(division);
        elementContainer.data('element_type', 'DIV');
        editor.makeElementDraggableRotatableAndResizable(elementContainer);
        editor.element_count++;
        return container;
      },
      createImageElement: function() {
        var container, elementContainer, image;
        container = $(editor.htmlStrings.elementContainer);
        elementContainer = container.find('.elementContainer');
        image = $(editor.htmlStrings.elements.imageElement).attr({
          id: "imgElement_" + editor.element_count,
          src: editor.settings.defaultImageSrc,
          alt: 'Load Image'
        });
        elementContainer.append(image);
        elementContainer.data('element_type', 'Image');
        editor.makeElementDraggableRotatableAndResizable(elementContainer);
        editor.element_count++;
        return container;
      },
      createTextElement: function() {
        var container, elementContainer, text;
        container = $(editor.htmlStrings.elementContainer);
        elementContainer = container.find('.elementContainer');
        text = $(editor.htmlStrings.elements.textElement).attr({
          id: "textElement_" + editor.element_count
        });
        elementContainer.append(text);
        elementContainer.data('element_type', 'Text');
        editor.makeElementDraggableRotatableAndResizable(elementContainer);
        editor.element_count++;
        return container;
      }
    };
    this["import"] = {
      getJSONString: function() {
        return $('.importJsonDiv').dialog({
          modal: true,
          buttons: {
            SUBMIT: function() {
              if ($('#json_input').val()) {
                editor["import"].createElements($('#json_input').val());
                return $(this).dialog("close");
              } else {

              }
            }
          }
        });
      },
      createElements: function(jsonString) {
        var elementJson, l, len, ref, results;
        editor.log('Importing Elements');
        elementJson = JSON.parse(jsonString);
        ref = elementJson.elements;
        results = [];
        for (l = 0, len = ref.length; l < len; l++) {
          element = ref[l];
          switch (element.type) {
            case 'DIV':
              results.push(editor["import"].createDiv(element));
              break;
            case 'Image':
              results.push(editor["import"].createImage(element));
              break;
            case 'Text':
              results.push(editor["import"].createText(element));
              break;
            default:
              results.push(this.log("\t invalid element type " + element.type + " countered while importign given json."));
          }
        }
        return results;
      },
      createDiv: function(eleJson) {
        var container;
        container = editor.elementCreation.createDivisionElement();
        return editor["import"].decorateElement(container, eleJson);
      },
      createImage: function(eleJson) {
        var container;
        container = editor.elementCreation.createImageElement();
        return editor["import"].decorateElement(container, eleJson);
      },
      createText: function(eleJson) {
        var container;
        container = editor.elementCreation.createTextElement();
        container.find('.textElement').html(eleJson.innerHTML);
        editor["import"].decorateElement(container, eleJson);
        return editor.elementInsertion.addCKEditorsEvents(container.find('.textElement'));
      },
      decorateElement: function(container, eleJson) {
        var draggableElement, elementContainer, rotationObj;
        elementContainer = container.find('.elementContainer');
        editor.addCommonElementEvents(elementContainer.parent('.draggableContainer'));
        editor.select_element(elementContainer.parent('.draggableContainer'));
        elementContainer.css('background-color', eleJson.background_color);
        elementContainer.width(eleJson.width / 100 * $element.width());
        elementContainer.height(eleJson.height / 100 * $element.height());
        draggableElement = elementContainer.parent('.draggableContainer');
        draggableElement.css('top', ((eleJson.position.top / 100) * $element.height()) + "px");
        draggableElement.css('left', ((eleJson.position.left / 100) * $element.width()) + "px");
        rotationObj = elementContainer.data('uiRotatable');
        rotationObj.performRotation(eleJson.rotation);
        rotationObj.elementCurrentAngle = eleJson.rotation;
        return $element.append(elementContainer.parent('.draggableContainer'));
      }
    };
    this["export"] = {
      displayElementJson: function() {
        var elementJson;
        elementJson = editor["export"].getElementsJson();
        return $('.displayJsonDiv').dialog({
          modal: true,
          buttons: {
            Ok: function() {
              return $(this).dialog("close");
            }
          }
        }).find('.exportedJson').text(JSON.stringify(elementJson));
      },
      getElementsJson: function() {
        var elementJson;
        elementJson = {
          elements: []
        };
        $element.find('.elementContainer').each(function(index, element) {
          return elementJson.elements.push(editor["export"].collectElementData($(element)));
        });
        return elementJson;
      },
      collectElementData: function(element) {
        var clone, heightPercents, parentElement, widthPercents;
        parentElement = element.parent('.draggableContainer');
        widthPercents = element.width() / $element.width() * 100;
        heightPercents = element.height() / $element.height() * 100;
        clone = element.clone();
        clone.find('.handler').remove();
        return {
          type: element.data('element_type'),
          position: editor["export"].getPositionInPercets(element),
          background_color: element.css('background-color'),
          rotation: editor["export"].getRotationDegrees(element),
          width: widthPercents,
          height: heightPercents,
          innerHTML: element.find('.textElement').length ? clone.find('.textElement').html() : null
        };
      },
      positionOfRotatedElement: function(element) {
        var position, rotationAngle, rotationObj;
        rotationObj = element.data('uiRotatable');
        rotationAngle = rotationObj.elementCurrentAngle;
        rotationObj.performRotation(0);
        position = element.offset();
        rotationObj.performRotation(rotationAngle);
        return position;
      },
      isElementRotated: function(element) {
        return !!element.data('uiRotatable').elementCurrentAngle;
      },
      getPositionInPercets: function(element) {
        var parentElement, position;
        parentElement = element.parent('.draggableContainer:first');
        position = editor["export"].isElementRotated(element) ? editor["export"].positionOfRotatedElement(element) : element.offset();
        return {
          top: (position.top - $element.offset().top) / $element.height() * 100,
          left: (position.left - $element.offset().left) / $element.width() * 100
        };
      },
      getRotationDegrees: function(element) {
        var angle, rotationString, values;
        rotationString = element.css("-webkit-transform") || element.css("-moz-transform") || element.css("-ms-transform") || element.css("-o-transform") || element.css("transform");
        if (rotationString !== "none") {
          values = rotationString.split("(")[1].split(")")[0].split(",");
          return angle = Math.atan2(values[1], values[0]);
        } else {
          return angle = 0;
        }
      }
    };
    this.saveElements = function() {
      var elementHash;
      elementHash = {};
      if (!!editor.settings.saveParamName) {
        elementHash[editor.settings.saveParamName] = editor["export"].getElementsJson().elements;
      } else {
        elementHash = editor["export"].getElementsJson();
      }
      if (!!editor.settings.saveUrl) {
        return $.ajax({
          url: editor.settings.saveUrl,
          data: elementHash,
          type: 'post',
          success: function(response) {
            return editor.log('Elements saved successfully!');
          },
          error: function(jqxhr, status, error) {
            return editor.log("Elements could not be saved due to " + error);
          }
        });
      } else {
        editor.log('No saveUrl option provided');
        return alert('No saveUrl option provided');
      }
    };
    this.deleteElement = function(event) {
      return $(event.target).parents('.draggableContainer:first').fadeOut({
        complete: function() {
          return $(this).remove();
        }
      });
    };
    this.log = function(message) {
      if (this.settings.debug) {
        return console.log(message);
      }
    };
    return this.init();
  };
  return $.fn.editor = function(options) {
    return this.each(function() {
      var plugin;
      if (undefined === $(this).data('editor')) {
        plugin = new $.editor(this, options);
        $(this).data('editor', plugin);
      }
    });
  };
})(jQuery);
