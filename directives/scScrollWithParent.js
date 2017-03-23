app.directive('scScrollWithParent', function ($window, $timeout) {
  'use strict';

  return {
    restrict: 'A',
    link: function (scope, element) {

      function scrollWithParent() {
        var elHeight = element.outerHeight(),
          elWidth = element.outerWidth(),
          parent = element.parent(),
          pHeight = parent.outerHeight(),
          navbarHeight = $('header nav').outerHeight() || 0,
          pTop = parent.offset().top - navbarHeight,
          grandParentMarginBottom = $($(parent).parent()).css('marginBottom');

        if (_.isEmpty(grandParentMarginBottom)) {
          grandParentMarginBottom = '0px';
        }
        var greaterThanStart = $($window).scrollTop() > pTop;
        var greaterThanEnd = $($window).scrollTop() > pTop + pHeight - elHeight + parseInt(grandParentMarginBottom);

        if (!greaterThanStart && element.hasClass('sc-scroll-with-parent')) {
          element.removeClass('sc-scroll-with-parent');
          parent.css('padding-top', 0);
          element.css('top', 'initial');
          element.css('width', 'initial');
          element.css('position', 'static');
          element.css('box-shadow', '0px 0px 0px');
        } else if (greaterThanStart && greaterThanEnd &&
                   !element.hasClass('sc-scroll-with-parent')) {
          element.addClass('sc-scroll-with-parent');
          parent.css('padding-top', elHeight);
          parent.css('position', 'static');
          element.css('top', navbarHeight + 'px');
          element.css('width', elWidth + 'px');
          element.css('bottom', 'initial');
          element.css('position', 'fixed');
          // element.css('box-shadow', '2px 2px 20px #ccc');
        } else if (!greaterThanEnd && element.hasClass('sc-scroll-with-parent')) {
          element.removeClass('sc-scroll-with-parent');
          element.css('top', 'initial');
          parent.css('position', 'relative');
          element.css('bottom', '-' + grandParentMarginBottom);
          element.css('position', 'absolute');
          element.css('box-shadow', '0px 0px 0px');
        }
      }

      var throttled = _.throttle(scrollWithParent, 50);

      $timeout(function () {
        //Throttling the call to scrollWithParent function to once every 100ms
        $($window).on('scroll resize', throttled);
      });

      scope.$on('$destroy', function () {
        $($window).off('scroll resize', throttled);
      });
    }
  };
});
