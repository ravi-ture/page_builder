(($) ->
  $.editor = (element, options)->

    # Defaults for editor
    @defaults =
      debug: false
      defaultImageSrc: '/assets/add_image.png'
      buttons: ['division', 'image', 'text', 'saveButton', 'exportJson', 'importJson', 'backgroundColor', 'borderOptions']
      keepDragHandler: true
      saveParamName: 'elements'
      saveUrl: ''
      deleteOptions: ['delete_icon', 'delete_key', 'delete_area']

    # merging the options with defaults
    @settings = {}

    # reference to editor throughtout plugin
    editor = this

    # reference to the jQuery version of DOM element
    $element = $(element)

    # setting element_count used for preparing id of elements
    @element_count = 0
    @getElementCount = -> @element_count

    # required default html strings.
    @htmlStrings =
      dialogBoxes:
        displayJson: "<div class='displayJsonDiv' title='Element JSON'><p class='exportedJson'></p></div>"
        importJson: "<div class='importJsonDiv' title='Import Elements'><form class='importJson'><label for='json_input'> Please paste json :<input type='text' name='json_input' id='json_input'/><p>Note: JSON should be exproted one with the same editor.</form></div>"
      elementContainer: "<div class='draggableContainer'><div id='' class = 'elementContainer'></div></div>"
      elements:
        divisionElement: "<div id='' class='divisionElement element'></div>"
        imageElement: "<img  id='' class='imageElement element' src='' width='50px' height='50px'/>"
        textElement: "<div id='' class='textElement element' style='text-align:center;' contenteditable='true'>Edit me </div>"
      handlers:
        draggHandler: "<span class='draggHandle handler'>dragg me</span>"
        resizeHandlers: "<span class='ui-resizable-handle handler ui-resizable-e' title='Resize this element'></span><span class='ui-resizable-handle handler ui-resizable-w' title='Resize this element' ></span><span class='ui-resizable-handle handler ui-resizable-n' title='Resize this element'></span><span class='ui-resizable-handle handler ui-resizable-s' title='Resize this element' ></span><span class='ui-resizable-handle handler ui-resizable-ne' title='Resize this element' ></span><span class='ui-resizable-handle handler ui-resizable-se' title='Resize this element' ></span><span class='ui-resizable-handle handler ui-resizable-sw' title='Resize this element' ></span><span class='ui-resizable-handle handler ui-resizable-nw' title='Resize this element'></span>"
        rotationHandler: "<span class='handler ui-rotatable-handle' draggable='true' title='Rotate this element'></span>"
        deletionHandler: "<span class='deletionHandler handler' title='Remove this element'></span>"
      tools:
        division: "<button class='toolbtn addDivElement'><img src='/assets/editorImages/plus.jpg'><span>Add Division</span></button>"
        image: "<button class='toolbtn addImgElement' ><img src='/assets/editorImages/addImage.jpg'><span>Add Image</span></button>"
        text: "<button class='toolbtn addTextElement' ><img src='/assets/editorImages/addText.jpg'><span>Add Text</span></button>"
        backgroundColor: "<div id='colorPicker' class='toolbtn elementBackgroundPicker'><img src='/assets/editorImages/paint.jpg'><span>Set Color</span></div>"
        saveButton: "<button class='toolbtn saveElements'>Save</button>"
        exportJson: "<button class='toolbtn exportElements' ><img src='/assets/editorImages/export.jpg'><span>Export JSON</span></button>"
        importJson: "<button class='toolbtn importElements' ><img src='/assets/editorImages/import.jpg'><span>Import JSON</span></button>"
        droppableButton: "<div class='toolbtn deleteElements' id='droppable' title='Drag Elements here to remove them.'><img src='/assets/editorImages/deleteElement.png'></div>"
        borderOptions: "<div id='colorPicker' class='toolbtn elementBorderOptions'></div>"

    @init = ->
      # merging default options to provided onces
      @settings = $.extend {}, @defaults, options

      # wrapping toolbar and element in a division
      $element.wrap( "<div class='editorContainerWrapper'></div>" );

      # loading the toolbar
      @appendToolbar()

      # loading dialogs
      @appendDialogBoxes()

      if @ckeditorExists() then CKEDITOR.disableAutoInline = true;

      if 'delete_key' in @settings.deleteOptions
        $(window).keydown (e) ->
          if e.keyCode is 46 and !$('.cke_focus').length
            $element.find('.selected-element').fadeOut
              complete: -> $(this).remove();

    @appendDialogBoxes = ->
      $element.after(@htmlStrings.dialogBoxes.displayJson)
      $element.after(@htmlStrings.dialogBoxes.importJson)

    @appendToolbar = ->
      toolbar = @prepareToolbar()
      $element.css('position', 'relative')
      toolbar.offset($element.position())
      if toolbar
        $element.before(toolbar)

    @ckeditorExists = ->  return (typeof(CKEDITOR) != 'undefined')

    @prepareToolbar = ->
      @log('Loading toolbar')
      toolbar = $('<div class = "toolbar"></div>')
      if 'delete_area' in @settings.deleteOptions
        @settings.buttons.push('droppableButton')
      $.each @settings.buttons, (index, buttonName) ->

        if editor.htmlStrings.tools.hasOwnProperty(buttonName)
          element = $(editor.htmlStrings.tools[buttonName])
          toolbar.append(element)
          editor.addElementEvents(element, buttonName)
        else
          editor.log("\t invalid option #{buttonName} for toolbar buttons")

      toolbar

    @append_color_pallete = (colorPicker) ->
      # Preparing color pallate
        colorPicker.append("<div class='colorPalletContainer'></div>")
        colorPallet = colorPicker.find('.colorPalletContainer')
        for i in [15..0] by 0-5
          for j in [15..0] by 0-5
            for k in [15..0] by 0-5
              color = "##{i.toString(16)}#{j.toString(16)}#{k.toString(16)}"
              colorPallet.append("<div class= 'colorPalletIcon' style='background-color: #{color};'></div>")

    @append_border_option_pallete = (borderDiv) ->
      #preparing the border options
      borderDiv.append("<div class='borderOptionsContainer'></div>")
      borderPallet = borderDiv.find('.borderOptionsContainer')
      borderPallet.append('<hr>')
      for i in ['inset', 'outset', 'dotted', 'ridge', 'solid', 'none']
        borderPallet.append("<div class='borderPalletIcon borderStyleIcon borderStyle#{i}' data-border-style='#{i}' style='border-style:#{i};'></div>")

    @addElementEvents = (element, elementType)->
      switch elementType
        when 'division' then @toolbarButtonEvents.addDivisionEvents(element)
        when 'image' then @toolbarButtonEvents.addImageEvents(element)
        when 'text' then @toolbarButtonEvents.addTextEvents(element)
        when 'backgroundColor' then @toolbarButtonEvents.addBackgroundColorEvents(element)
        when 'saveButton' then @toolbarButtonEvents.addSaveElementsEvent(element)
        when 'exportJson' then @toolbarButtonEvents.addExportToJsonEvent(element)
        when 'droppableButton' then @toolbarButtonEvents.addDroppableEvent(element)
        when 'borderOptions' then @toolbarButtonEvents.addBackgroundOptions(element)
        when 'importJson' then @toolbarButtonEvents.addImportFromJsonEvent(element)
        else @log("\t invalid element type #{elementType} countered while binding events to tool.")

    @addCommonElementEvents = (element) ->
      element.mousedown ->
        $element.find('.selected-element').removeClass('selected-element')
        $(this).addClass('selected-element');

    @selected_element = ->
      selectedElement = $element.find('.selected-element')
      if selectedElement.length
        selectedElement
      else
        null

    @select_element = (element)->
      $element.find('.selected-element').removeClass('selected-element')
      element.addClass('selected-element')

    @toolbarButtonEvents =
      addDivisionEvents: (divisionButton) ->
        divisionButton.on 'click', editor.elementInsertion.addDivisionElement

      addImageEvents: (imageButton) ->
        imageButton.on 'click', editor.elementInsertion.addImageElement

      addTextEvents: (textButton) ->
        textButton.on 'click', editor.elementInsertion.addTextElement

      addBackgroundColorEvents: (colorPicker) ->
        editor.append_color_pallete(colorPicker)
        colorPicker.on 'click', -> $(this).find('.colorPalletContainer').slideToggle()

        colorPicker.find('.colorPalletIcon').on 'click', ->
          selected_element = editor.selected_element()
          if selected_element && !selected_element.find('.imageElement').length
            selected_element
              .find('.elementContainer')
              .css('background-color', $(this).css('background-color'))

      addSaveElementsEvent: (element) ->
        element.on 'click', editor.saveElements

      addExportToJsonEvent: (element) ->
        element.on 'click', editor.export.displayElementJson

      addImportFromJsonEvent: (element) ->
        element.on 'click', editor.import.getJSONString

      addDroppableEvent: (element) ->
        $(element).droppable
          tolerance: 'pointer'
          drop: ( event, ui ) ->
            ui.draggable.fadeOut
              complete: ->
                $(this).remove()

      addBackgroundOptions: (borderOptionsTool) ->
        editor.append_color_pallete(borderOptionsTool)
        editor.append_border_option_pallete(borderOptionsTool)
        borderOptionsTool.on 'click', ->
          $(this).find('.borderOptionsContainer, .colorPalletContainer').slideToggle()

        borderOptionsTool.find('.colorPalletIcon').on 'click', ->
          selected_element = editor.selected_element()
          if selected_element && !selected_element.find('.imageElement').length
            selected_element
              .find('.elementContainer')
              .css('border-color', $(this).css('background-color'))

        borderOptionsTool.find('.borderPalletIcon').on 'click', ->
          selected_element = editor.selected_element()
          if selected_element && !selected_element.find('.imageElement').length
            borderStyle = $(this).css(['border-top-style', 'border-bottom-style', 'border-right-style', 'border-left-style'])
            selected_element
              .find('.elementContainer')
              .css borderStyle

    @makeElementDraggableRotatableAndResizable = (element)->
      @elementCreation.addHandlers(element)
      element.resizable
        handles:
          n: element.find('span.ui-resizable-n')
          e: element.find('span.ui-resizable-e')
          w: element.find('span.ui-resizable-w')
          s: element.find('span.ui-resizable-s')
          ne: element.find('span.ui-resizable-ne')
          se: element.find('span.ui-resizable-se')
          sw: element.find('span.ui-resizable-sw')
          nw: element.find('span.ui-resizable-nw')
      .rotatable
        handle: element.find('span.ui-rotatable-handle')
      element.parent('.draggableContainer').draggable
        handle: if editor.settings.keepDragHandler then '.draggHandle' else null

    @elementInsertion =
      addDivisionElement: ->
        element = editor.elementCreation.createDivisionElement()
        $element.append(element)
        editor.addCommonElementEvents(element)
        editor.select_element(element)

      addImageElement: ->
        element = editor.elementCreation.createImageElement()
        $element.append(element)
        editor.addCommonElementEvents(element)
        editor.select_element(element)

      addTextElement: ->
        element = editor.elementCreation.createTextElement()
        textElement = $(element).find('.textElement')
        $element.append(element)
        editor.addCommonElementEvents(element)
        editor.select_element(element)
        editor.elementInsertion.addCKEditorsEvents(textElement)

      addCKEditorsEvents: (textElement) ->
        return unless editor.ckeditorExists()
        # Text element related event bindings
        $(textElement).dblclick ->
          unless $(this).attr('contenteditable') == true
            $(this).attr 'contenteditable', true
            $(this).parents('.elementContainer:first').resizable('disable')
            $(this).parents('.draggableContainer:first').draggable('disable')
            $(this).focus()

        ckInstance = CKEDITOR.inline textElement[0].id,
          toolbar: [
              name: 'basicstyles'
              groups: [ 'basicstyles' ]
              items: [ 'Bold', 'Italic', 'Underline', 'Strike' ]
            ,
              name: 'paragraph',
              groups: [ 'list', 'indent', 'blocks', 'align' ],
              items: [ 'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock' ]
            ,
              name: 'colors'
              items: [ 'TextColor', 'BGColor' ]
            ,
              name: 'styles'
              items: ['FontSize']
          ]

        ckInstance.on 'blur', (event) ->
          textElement = $(event.editor.element.$)
          textElement.parents('.draggableContainer:first').draggable('enable')
          textElement.parents('.elementContainer:first').resizable('enable')
          $(this).attr 'contenteditable', false

    @elementCreation =
      getHandlerString: ->
        [
          editor.htmlStrings.handlers.resizeHandlers,
          editor.htmlStrings.handlers.rotationHandler,
          (if 'delete_icon' in editor.settings.deleteOptions then editor.htmlStrings.handlers.deletionHandler else ''),
          (if editor.settings.keepDragHandler then editor.htmlStrings.handlers.draggHandler else '')
        ].join('')

      addHandlers: (element) ->
        handlers = $(@getHandlerString())
        handlers.filter('.handler').attr
          id: "elementhandler_#{editor.element_count}"

        if 'delete_icon' in editor.settings.deleteOptions
          handlers.filter('.deletionHandler.handler').on 'click', editor.deleteElement

        element.append(handlers)

      createDivisionElement: ->
        container = $(editor.htmlStrings.elementContainer)
        elementContainer = container.find('.elementContainer')
        division = $(editor.htmlStrings.elements.divisionElement)
          .attr
            id: "divisionElement_#{editor.element_count}"
        elementContainer.append(division)
        elementContainer.data('element_type', 'DIV')
        editor.makeElementDraggableRotatableAndResizable(elementContainer)
        editor.element_count++
        container

      createImageElement: ->
        container = $(editor.htmlStrings.elementContainer)
        elementContainer = container.find('.elementContainer')
        image = $(editor.htmlStrings.elements.imageElement)
          .attr
            id: "imgElement_#{editor.element_count}"
            src: editor.settings.defaultImageSrc
            alt: 'Load Image'
        elementContainer.append(image)
        elementContainer.data('element_type', 'Image')
        editor.makeElementDraggableRotatableAndResizable(elementContainer)
        editor.element_count++
        container

      createTextElement: ->
        container = $(editor.htmlStrings.elementContainer)
        elementContainer = container.find('.elementContainer')
        text = $(editor.htmlStrings.elements.textElement)
          .attr
            id: "textElement_#{editor.element_count}"
        elementContainer.append(text)
        elementContainer.data('element_type', 'Text')
        editor.makeElementDraggableRotatableAndResizable(elementContainer)
        editor.element_count++
        container

    @import =
      getJSONString: -> # receiving json string from user to prepare elements.
        $('.importJsonDiv').dialog
          modal: true
          buttons:
            SUBMIT: ->
              if $('#json_input').val()
                editor.import.createElements($('#json_input').val())
                $( this ).dialog( "close" )
              else
                return

      createElements: (jsonString) ->
        editor.log('Importing Elements')
        elementJson = JSON.parse(jsonString)
        for element in elementJson.elements
          switch element.type
            when 'DIV' then editor.import.createDiv(element)
            when 'Image' then editor.import.createImage(element)
            when 'Text' then editor.import.createText(element)
            else
              @log("\t invalid element type #{element.type} countered while importign given json.")

      createDiv: (eleJson) ->
        container = editor.elementCreation.createDivisionElement()
        editor.import.decorateElement(container, eleJson)

      createImage: (eleJson) ->
        container = editor.elementCreation.createImageElement()
        editor.import.decorateElement(container, eleJson)

      createText: (eleJson) ->
        container = editor.elementCreation.createTextElement()
        container.find('.textElement').html(eleJson.innerHTML)
        editor.import.decorateElement(container, eleJson)
        editor.elementInsertion.addCKEditorsEvents(container.find('.textElement'))

      decorateElement: (container, eleJson) ->
        elementContainer = container.find('.elementContainer')
        editor.addCommonElementEvents(elementContainer.parent('.draggableContainer'))
        editor.select_element(elementContainer.parent('.draggableContainer'))
        elementContainer.css('background-color', eleJson.background_color)

        elementContainer.width(eleJson.width/100 * $element.width())
        elementContainer.height(eleJson.height/100 * $element.height())

        draggableElement = elementContainer.parent('.draggableContainer')
        draggableElement.css('top', "#{(eleJson.position.top/100) * $element.height()}px");
        draggableElement.css('left', "#{(eleJson.position.left/100) * $element.width()}px");

        rotationObj = elementContainer.data('uiRotatable')
        rotationObj.performRotation(eleJson.rotation)
        rotationObj.elementCurrentAngle = eleJson.rotation

        $element.append(elementContainer.parent('.draggableContainer'))

    @export =
      displayElementJson: ->
        elementJson = editor.export.getElementsJson()
        $('.displayJsonDiv').dialog
          modal: true
          buttons:
            Ok: ->
              $( this ).dialog( "close" )
        .find('.exportedJson').text(JSON.stringify(elementJson))

      getElementsJson: ->
        elementJson = {elements: []}
        $element.find('.elementContainer').each (index, element) ->
          elementJson.elements.push editor.export.collectElementData($(element))
        elementJson

      collectElementData: (element) ->
        parentElement = element.parent('.draggableContainer')
        widthPercents = element.width()/$element.width()*100
        heightPercents = element.height()/$element.height() *100
        clone = element.clone()
        clone.find('.handler').remove()
        {
          type: element.data('element_type'),
          position: editor.export.getPositionInPercets(element),
          background_color: element.css('background-color'),
          rotation: editor.export.getRotationDegrees(element),
          width: widthPercents,
          height: heightPercents,
          innerHTML: if element.find('.textElement').length then clone.find('.textElement').html() else null
        }

      positionOfRotatedElement: (element) ->
        rotationObj = element.data('uiRotatable')
        rotationAngle = rotationObj.elementCurrentAngle
        rotationObj.performRotation(0)
        position = element.offset()
        rotationObj.performRotation(rotationAngle)
        position

      isElementRotated: (element) ->
        !!element.data('uiRotatable').elementCurrentAngle

      getPositionInPercets: (element) ->
        parentElement = element.parent('.draggableContainer:first')
        position = if editor.export.isElementRotated(element)
          editor.export.positionOfRotatedElement(element)
        else
          element.offset()

        {
          top: (position.top - $element.offset().top)/$element.height() * 100
          left: (position.left - $element.offset().left)/$element.width() * 100
        }

      getRotationDegrees: (element) ->
        rotationString = element.css("-webkit-transform") or element.css("-moz-transform") or element.css("-ms-transform") or element.css("-o-transform") or element.css("transform")
        if rotationString isnt "none"
          values = rotationString.split("(")[1].split(")")[0].split(",")
          angle = Math.atan2(values[1], values[0])
        else
          angle = 0

    @saveElements = -> # this method will make an ajax request to the given url
      elementHash = {}
      if !!editor.settings.saveParamName
        elementHash[editor.settings.saveParamName] = editor.export.getElementsJson().elements
      else
        elementHash = editor.export.getElementsJson()

      if !!editor.settings.saveUrl
        $.ajax
          url: editor.settings.saveUrl
          data: elementHash
          type: 'post'
          success: (response) ->
            editor.log 'Elements saved successfully!'
          error: (jqxhr, status, error) ->
            editor.log "Elements could not be saved due to #{error}"
      else
        editor.log 'No saveUrl option provided'
        alert('No saveUrl option provided')

    @deleteElement = (event) ->
      $(event.target).parents('.draggableContainer:first').fadeOut
        complete: ->
          $(this).remove()

    @log = (message)->
      # logging the messages if debug option is set
      if @settings.debug
        console.log(message)

    @init();

  $.fn.editor = (options) ->
    @each ->
      if `undefined` is $(this).data('editor')
        plugin = new $.editor(this, options)
        $(this).data 'editor', plugin
      return
) jQuery