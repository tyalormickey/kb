$(window).ready(function (event) {
  ui.init();
});

var ui = (function () {
  var init = function () {
    inputFocusCheck();
    accordion();
    //customSelect();
    //allMenu();

    viewportHandler()
  }

  function viewportHandler() {
    var currentHeight = window.visualViewport.height;
    // $('body, .wrapper').css('height', viewport.height);
    var actions = function () {
      // $('body, .wrapper').css('height', viewport.height);
      var $wrapper = $('.wrapper');
      setTimeout(function () {
        if (currentHeight > window.visualViewport.height) {
          $('html').removeClass('outer-overflow');
          $wrapper.addClass('footer-hide');
        } else {
          $('html').addClass('outer-overflow');
          $wrapper.removeClass('footer-hide');
        }
      }, 300)
    }
    window.visualViewport.addEventListener('resize', actions);
  }

  function inputFocusCheck() {
    var $wrapper = $('.wrapper');

    $('html').addClass('outer-overflow');
    $('input, textarea').focus(function () {
      if (!['checkbox', 'radio'].includes($(this).attr('type'))) {
        $('html').removeClass('outer-overflow');
        $wrapper.addClass('footer-hide');
      }
    }).blur(function () {
      $('html').addClass('outer-overflow');
      $wrapper.removeClass('footer-hide');
    })
  }

  function accordion () {
    $('.accordion').each(function () {
      var $ele = $(this);
      $ele.find('dt > button').off('click').on('click', function(){
        var $parent = $(this).closest('dl');
        if ($parent.hasClass('active')) {
          $parent.removeClass('active');
          $parent.find('dd').stop().slideUp();
          $(this).find('i').text('열기');
        } else {
          $parent.siblings().removeClass('active').find('dd').slideUp();
          $parent.addClass('active');
          $parent.find('dd').stop().slideDown();
          $(this).find('i').text('닫기');
        }
      });
    });
  }

  function customSelect () {
    var $select = $('.custom-select');
    $select.each(function() {
      var $ele = $(this);
      var $showTitle = $ele.find('dt span');

      if ($ele.find('dd .selected').length > 0) {
        $ele.find('dl').removeClass('default');
        $showTitle.text($ele.find('dd .selected button').text());
      } else {
        $ele.find('dl').addClass('default');
      }

      $ele.find('dt button').off('click').on('click', function () {
        $select.not($ele).removeClass('active');
        if ($ele.hasClass('active')) {
          $ele.removeClass('active');
        } else {
          $ele.addClass('active');
        }
      }).on('blur', function () {
        setTimeout(function () {
          $ele.removeClass('active');
        }, 100)
      });

      $ele.find('li').off('click').on('click', function () {
        $(this).addClass('selected').siblings().removeClass('selected');
        $showTitle.text($(this).find('button').text());
        $ele.removeClass('active');
        $ele.find('dl').removeClass('default');
      });
    });
  }

  function allMenu() {
    var bg = null
    $('[data-button="menu"]').off('click').on('click', function () {
      if ($('.modal-popup__bg').length === 0) {
        $('body').append('<div class="modal-popup__bg"></div>');
      }
      bg = $('.modal-popup__bg');
      bg.fadeIn(200, 'linear');

      $('.wrapper-full-popup').addClass('active');
    });
    $('[data-button="menu-close"]').off('click').on('click', function () {
      $('.wrapper-full-popup').removeClass('active');
      bg.fadeOut(200, 'linear');
    });
  }

  return {
    init: init,
    customSelect: customSelect,
    allMenu: allMenu
  }
})();

var modal = (function () {
  var popupCount = 0;
  var bg = null
  var links = []

  function openSet (obj, openAfterAction) {
    if (popupCount === 0 && bg == null) {
      if ($('.modal-popup__bg').length === 0) {
        $('body').append('<div class="modal-popup__bg"></div>');
      }
      bg = $('.modal-popup__bg');
    }
    popupCount = popupCount + 1;

    /* open */
    $('body').addClass('body-is-modal');
    obj.fadeIn(200, 'linear', function () {
      obj.addClass('active');
      if (openAfterAction) openAfterAction();
    });
    bg.fadeIn(200, 'linear');

    /* focus */
    var modalChildren = obj.find('a, button, input, object, select, textarea');
    modalChildren.first().focus();
    if (modalChildren.length === 1) {
      modalChildren.off('keydown').on('keydown', function (e) {
        if (e.keyCode === 9) {
          modalChildren.first().focus();
          return false;
        }
      });
    } else {
      modalChildren.last().off('keydown').on('keydown', function (e) {
        if (e.keyCode === 9) {
          if (!e.shiftKey) {
            modalChildren.first().focus();
            return false;
          }
        }
      });
      modalChildren.first().off('keydown').on('keydown', function (e) {
        if (e.keyCode === 9) {
          if (e.shiftKey) {
            modalChildren.last().focus();
            return false;
          }
        }
      });
    }
  }

  function open (link, target, openAfterAction) {
    var popObj = $(target)
    var linkHref = link;

    links.push(link);
    openSet(popObj, openAfterAction);

    popObj.find('.modal-popup__close').off('click').on('click', function () {
      close(popObj);
      linkHref.focus();
      return false;
    });
  }

  function close (obj) {
    var $closeTarget = obj.hasClass('modal-popup') ? obj : obj.closest('.modal-popup')

    popupCount = popupCount - 1;
    if (links[popupCount]) {
      links[popupCount].focus();
      links.pop();
    }

    $('body').removeClass('body-is-modal');

    if (popupCount === 0) { bg.fadeOut(200); }
    if ($closeTarget.hasClass('alert-pop')) {
      $closeTarget.remove();
    } else {
      $closeTarget.removeClass('active').fadeOut(200, 'linear');
    }
  }

  function alert (link, config) {
    // { type, text, ok, cancel }
    var alertSet = {
      type: config.type || 'alert',
      text: config.text || '메세지를 넣어주세요.',
      okText: config.okText || '확인',
      cancelText: config.cancelText || '취소',
      ok: config.ok,
      cancel: config.cancel,
      closeIcon: !!config.closeIcon,
      buttonSize: config.buttonSize || 'small',
      mode: config.multiple,
    }
    var buttonCloseSource = ''
    if (alertSet.closeIcon) {
      buttonCloseSource = '<article class="modal-popup__header"><button class="modal-popup__close only-icon"><i class="icon-x icon-20">닫기</i></button></article>'
    }
    var buttonAddSource = alertSet.type === 'alert' ? '' : '<button type="button" class="alert-popup__cancel block gray ' + alertSet.buttonSize + ' inline">'+ alertSet.cancelText +'</button>'
    var $alert = $('' +
        '<div class="modal-popup modal-popup--alert">' +
        '  <div class="modal-popup__outer">' +
        '    <section class="modal-popup__container">' +
        buttonCloseSource +
        '      <article class="modal-popup__body">' +
        '        <p class="modal-popup__alert-message">'+
        alertSet.text +
        '        </p>' +
        '      </article>' +
        '      <article class="modal-popup__footer">' +
        buttonAddSource +
        '        <button type="button" class="alert-popup__ok block ' + alertSet.buttonSize + ' inline">' +
        alertSet.okText +
        '        </button>' +
        '      </article>' +
        '    </section>' +
        '  </div>' +
        '</div>');
    $('body').append($alert);

    if (link) { links.push(link); }
    openSet($alert);

    /* 2021.08.05 수정 (multiple 케이스 추가) */
    $alert.find('button').off('click').on('click', function () {
      if(!config.mode == "multiple"){ close($alert); }

      if ($(this).hasClass('alert-popup__ok')) {
        if (alertSet.ok) { alertSet.ok(link); }
        if (config.mode == "multiple" ){
            $alert.find(".multiple__change-text").html(config.modeChangeText);
            if($alert.find(".alert-popup__cancel").length == 0){
              close($alert);
              setTimeout(function () { $alert.remove(); }, 300);
            }else{
              $alert.find(".alert-popup__cancel").remove();
            }
        }else{
          close($alert);
          setTimeout(function () { $alert.remove(); }, 300);
        }
      } else if ($(this).hasClass('alert-popup__cancel')) {
        if (alertSet.cancel) { alertSet.cancel(link); }
<<<<<<< HEAD
        if (config.mode == "multipleCancle" ){
          $alert.find(".multiple__change-text").html(config.modeChangeText);
          if($alert.find(".alert-popup__cancel").length == 0){
            close($alert);
            setTimeout(function () { $alert.remove(); }, 300);
          }else{
            $alert.find(".alert-popup__cancel").remove();
          }
        }else{
=======
>>>>>>> origin/master
          close($alert);
          setTimeout(function () { $alert.remove(); }, 300);
      }

      if(!config.mode == "multiple"){
<<<<<<< HEAD
        setTimeout(function () { $alert.remove(); }, 300); }
=======
        setTimeout(function () {
          $alert.remove(); }, 300);
          console.log("aaa");
         }
>>>>>>> origin/master
      return false;
    });
  }
  /* EOD : 2021.08.05 수정 (multiple 케이스 추가) */

  return {open: open, close: close, alert: alert}
})();

var toast = (function () {
  function toast(msg, timer) {
    if (!timer) { timer = 2000; }

    if ($('.toast').length === 0) {
      $('body').append('<div class="toast"></div>');
    }

    var $eleWrap = $('.toast');

    if ($('.footer').length > 0 && $('.modal-popup.active').length === 0) {
      $eleWrap.addClass('has-header');
    } else {
      $eleWrap.removeClass('has-header');
    }

    var $item = $('<div class="toast__item"><span>' + msg + '</span></div>');
    $eleWrap.append($item); // top = prepend
    $item.slideToggle(100, function () {
      if (!isNaN(timer)) {
        setTimeout(function () {
          $item.fadeOut(function () {
            $(this).remove();
          });
        }, timer);
      }
    });

    $item.off('click').on('click', function () {
      $item.fadeOut(function () {
        $(this).remove();
      });
    });
  }

  return { open: toast }
})();

var tooltip = (function () {
  function focusMoveSet (obj) {
    /* open */
    obj.fadeIn(200, 'linear', function () { obj.addClass('active'); });

    /* focus */
    var focusItems = obj.find('a, button, input, object, select, textarea');
    focusItems.first().focus();
    if (focusItems.length === 1) {
      focusItems.off('keydown').on('keydown', function (e) {
        if (e.keyCode === 9) {
          focusItems.first().focus();
          return false;
        }
      });
    } else {
      focusItems.last().off('keydown').on('keydown', function (e) {
        if (e.keyCode === 9) {
          if (!e.shiftKey) {
            focusItems.first().focus();
            return false;
          }
        }
      });
      focusItems.first().off('keydown').on('keydown', function (e) {
        if (e.keyCode === 9) {
          if (e.shiftKey) {
            focusItems.last().focus();
            return false;
          }
        }
      });
    }
  }

  function open (obj) {
    var $tooltip = obj;
    var $tooltipParent = $tooltip.closest('.tooltip-button');
    var title = $tooltipParent.attr('data-title');
    var msg = $tooltipParent.attr('data-text');
    var $etc = $tooltipParent.siblings('.tooltip-add');

    var tooltipTitle = ''
    var tooltipMsg = ''
    if (title) {
      tooltipTitle = '<div class="tooltip-modal__title">'+ title + '</div>'
    }
    console.log($etc)
    if (msg || $etc.length > 0) {
      var text = msg ? ('<p>' + msg + '</p>') : '';
      var etc = $etc.length > 0 ? $etc.html() : '';
      tooltipMsg = '<div class="tooltip-modal__message">'+ text + etc + '</div>'
    }

    if ($('.tooltip-modal').length === 0) {
      var source = $(
          '<div class="tooltip-modal">' +
          '  <div class="tooltip-modal__outer">' +
          '    <div class="tooltip-modal__box">' +
          '      <button type="button" class="tooltip-modal__close only-icon">' +
          '        <i class="icon-x icon-16">툴팁닫기</i>' +
          '      </button>' +
          tooltipTitle +
          tooltipMsg +
          '    </div>' +
          '  </div>' +
          '</div>');
      $('body').append(source);
    } else {
      $('.tooltip-modal__message').html(msg);
    }

    if ($('.modal-popup__bg').length === 0) {
      $('body').append('<div class="modal-popup__bg"></div>');
    }
    var bg = $('.modal-popup__bg');
    bg.fadeIn(200, 'linear');

    var $tModal = $('.tooltip-modal');
    focusMoveSet($tModal)
    $('.tooltip-modal__close').off('click').on('click', function () {
      $tooltip.focus();
      $tModal.remove();
      bg.fadeOut(200);
    });
  }

  return {open: open}
})();

var tab = (function () {
  var onItem = 'tab__item--on'
  var onCont = 'tab__content--on'
  function removeClass(el) {
    el.find('> .tab > .tab__item').removeClass(onItem)
    el.find('> .tab__content-wrap > .tab__content').removeClass(onCont)
  }
  function reset () {
    $('.tab__wrap').each(function () {
      removeClass($(this));
      $(this).find('.tab__item').eq(0).addClass(onItem)
      $(this).find('.tab__content').eq(0).addClass(onCont)
    })
  }
  function action (el, swipe, swipeItem) {
    var parent = el.parent().parent();
    var contents = parent.find('> .tab__content-wrap > .tab__content');
    removeClass(parent);
    el.addClass(onItem);
    contents.eq(el.index()).addClass(onCont)
    if (swipe) {
      swipeItem.slideTo(el.index());
    }
  }
  return { reset: reset, action: action }
})();
