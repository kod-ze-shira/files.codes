// select 2
(function(){
	// select 2 default
	$('.js-select-2').select2({
		width: '100%'
	});

	// select 2 without search
	$('.js-select-2-no-search').select2({
		width: '100%',
		minimumResultsForSearch: -1
	});

	// select 2 with dropdown icons
	function iformat(icon) {
		var originalOption = icon.element;
		return $('<span class="select2-icon-option"><i class="la la-' + $(originalOption).data('icon') + '"></i> ' + icon.text + '</span>');
	}

	$('.js-select-2-with-icons').select2({
		width: '100%',
		templateResult: iformat
	});
}());

// add class for native selects
(function(){
	$('select').on('change', function(){
		$(this).addClass('active');
	});
}());

// slider
(function(){
	const slider = $('.js-slider');
	if (slider.length) {
		slider.each(function(){
			const _this = $(this),
						min = _this.data('min'),
						max = _this.data('max'),
						start = _this.data('start'),
						end = _this.data('end'),
						step = _this.data('step'),
						tooltips = _this.data('tooltips');

			let optionStart = [start],
					optionConnect = [true, false],
					optionTooltips = false;

			if (end) {
				optionStart = [start, end];
				optionConnect = true;
			}

			if (tooltips) {
				optionTooltips = [true];
				if (end) {
					optionTooltips = [true, true];
				}
			}

			noUiSlider.create(_this[0], {
				start: optionStart,
				connect: optionConnect,
				step: step,
				tooltips: optionTooltips,
				range: {
					'min': min,
					'max': max
				},
				format: wNumb({
					decimals: 0
				})
			});
		});
	}
}());

// toggle sidebar
(function(){
	var sidebar = $('.js-sidebar'),
			sidebarContainer = sidebar.find('.js-sidebar-container');

			nav = sidebar.find('.js-nav'),
			navLinkMenu = nav.find('.js-nav-link-menu'),
			navPrimary = nav.find('.js-nav-primary'),
			navSecondary = nav.find('.js-nav-secondary'),

			container = $('.js-container'),
			containerToggle = $('.js-container-toggle, .js-sidebar-toggle');

	var visibleNavSecondary = false;

	containerToggle.on('click', function(){
		container.toggleClass('extended')
		sidebarContainer.toggleClass('toggled');
		nav.toggleClass('extended');
	});

	navLinkMenu.on('click', function(){
		visibleNavSecondary = !visibleNavSecondary;
		navLinkMenu.toggleClass('active');
		navSecondary.toggleClass('visible');
	});

	// show/hide menu on scroll on mobile
	var prevScrollPos = $(window).scrollTop();

	$(window).scroll(function(){
		var currentScrollPos = $(window).scrollTop();

		if (!visibleNavSecondary && (prevScrollPos < currentScrollPos)) {
			if (!navPrimary.hasClass('hidden')) {
				navPrimary.addClass('hidden');
			}
		} else {
			navPrimary.removeClass('hidden');
		}

		prevScrollPos = currentScrollPos;
	});
}());

// search
(function(){
	var search = $('.js-search');
	if (search.length) {
		var open = search.find('.js-search-open'),
				input = search.find('.js-search-input'),
				dropdown = search.find('.js-search-dropdown'),
				results = search.find('.js-search-results'),
				backdrop = search.find('.js-search-backdrop');

		open.on('click', function(){
			search.addClass('open');
			input.focus();
		});

		input.on('keyup', function(){
			if ($(this).val().length >= 3) {
				results.addClass('visible');
			} else {
				results.removeClass('visible');
			}
		});

		backdrop.on('click', function(){
			search.removeClass('open');
		});
	}
}());

// new
(function(){
	var _new = $('.js-new');
	if (_new.length) {
		var open = _new.find('.js-new-open'),
				dropdown = _new.find('.js-new-dropdown'),
				backdrop = _new.find('.js-new-backdrop');

		open.on('click', function(){
			_new.toggleClass('open');
		});

		backdrop.on('click', function(){
			_new.removeClass('open');
		});
	}
}());

// layout mobile tabs
(function(){
	var layout = $('.js-layout');
	if (layout.length) {
		var action = layout.find('.js-layout-action'),
				tab = layout.find('.js-layout-tab');

		action.on('click', function(){
			var index = $(this).index();

			action.removeClass('active');
			action.eq(index).addClass('active');

			tab.removeClass('visible');
			tab.eq(index).addClass('visible');
		});
	}
}());

// panel tabs
(function(){
	var panel = $('.js-panel');
	if (panel.length) {
		var btn = panel.find('.js-panel-btn, .js-panel-action'),
				tab = panel.find('.js-panel-tab');

		btn.on('click', function(){
			var index = $(this).index();

			btn.removeClass('active');
			btn.eq(index).addClass('active');

			tab.hide();
			tab.eq(index).show();
		});
	}
}());

// sort
(function(){
	var sort = $('.js-sort');
	if (sort.length) {
		var head = sort.find('.js-sort-head'),
				selected = sort.find('.js-sort-selected'),
				dropdown = sort.find('.js-sort-dropdown'),
				switch_ = sort.find('.js-sort-switch'),
				apply = sort.find('.js-sort-apply'),
				backdrop = sort.find('.js-sort-backdrop');

		head.on('click', function(){
			sort.addClass('open');
		});

		switch_.on('change', function(){
			selected.text($(this).find('span').text());
		});

		apply.on('click', function(){
			sort.removeClass('open');
		});

		backdrop.on('click', function(){
			sort.removeClass('open');
		});
	}
}());

// menu
(function(){
	var menus = $('.js-menu');
	if (menus.length) {
		menus.each(function(){
			var menu = $(this),
					menuHead = menu.find('.js-menu-head'),
					menuToggle = menu.find('.js-menu-toggle'),
					menuContainer = menu.find('.js-menu-container'),
					menuItem = menu.find('.js-menu-item'),
					menuBackdrop = menu.find('.js-menu-backdrop');

			menuToggle.on('click', function(){
				menuContainer.addClass('visible');
				menuBackdrop.show();
			});

			menuItem.on('click', function(e){
				e.preventDefault();

				var _this = $(this),
						group = _this.data('menu-group'),
						tab = _this.data('menu-item'),
						content = _this.html();

				menuItem.removeClass('active');
				_this.addClass('active');

				$(`[data-tabs-group="${group}"]`).hide();
				$(`[data-tabs-item="${tab}"]`).show();

				menuHead.find('.js-menu-item').html(content);
				hideMenu();
			});

			menuBackdrop.on('click', function(){
				hideMenu();
			});

			function hideMenu(){
				menuContainer.removeClass('visible');
				menuBackdrop.hide();
			}
		});
	}
}());

// modal
(function(){
	$('[data-modal]').on('click', function(e){
		e.preventDefault();
		const modal = $($(this).data('modal'));
		modal.addClass('visible');
	});

	$('.js-modal-close').on('click', function(){
		$(this).parents('.js-modal').removeClass('visible');
	});

	$('.js-modal').on('click', function(){
		$(this).removeClass('visible');
	});

	$('.js-modal-container').on('click', function(e){
		e.stopPropagation();
	});
}());

// accordion
(function(){
	const accordion = $('.js-accordion');
	if (accordion.length) {
		const head = accordion.find('.js-accordion-head'),
					body = accordion.find('.js-accordion-body');

		head.on('click', function(){
			const _this = $(this);
			if (!_this.hasClass('active')) {
				head.removeClass('active');
				body.slideUp();
				_this.addClass('active');
				_this.next().slideDown();
			} else {
				head.removeClass('active');
				body.slideUp();
			}
		});
	}
}());





