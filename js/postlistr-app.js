window.wp = window.wp || {};

(function($) {
	var postlistr;

	postlistr = wp.postlistr = { model: {}, view: {}, controller: {} };
	postlistr.formclass = '.listr-header';
	postlistr.initalurl = 'dsgnwrks.pro';

	postlistr.model.Posts = Backbone.Collection.extend({
		model: Backbone.Model.extend({}),
		parse: function(response) {
			return response.posts;
		}
	});

	postlistr.view.PostView = Backbone.View.extend({
		render: function() {
			this.setElement( $('<li/>').attr( 'class', 'row' ) );
			// Process the template
			this.$el.html( _.template( $('#tmpl-postlistr').html(), this.model.attributes) );
			return this;
		}
	});

	postlistr.view.PostList = Backbone.View.extend({
		render: function() {
			var $postList = this.$el;
			var $input = $( postlistr.formclass +' input' );
			$postList.empty();
			this.collection.each(function(model) {
				var postView = new postlistr.view.PostView({
					model: model
				});
				postView.render().$el.appendTo($postList);
			});

			// fill the input with the default url if the first load
			if ( ! $input.val() )
				$input.val(postlistr.initalurl);

			return this;
		},
		initialize: function() {
			this.collection.fetch(); // Auto-load when created
			this.listenTo(this.collection, 'sync reset', this.render);
		}
	});

	postlistr.view.BlogForm = Backbone.View.extend({
		events: {
			'submit form': function(evt) {
				evt.preventDefault();
				// Get whatever the user entered (Strip slashes)
				var blog = this.$el.find('input').val().replace(/\//g, '');

				// If nothing was entered
				if (!blog)
					return;

				this.collection.url = ['http://public-api.wordpress.com/rest/v1/sites/', blog, '/posts/?number=10&callback=?'].join('');

				// Hi developer!
				console.log(this.collection.url);

				this.collection.reset();
				this.collection.fetch({
					reset: true
				});
			}
		}
	});

	postlistr.view.LoadingSpinner = Backbone.View.extend({
		toggle: function() {
			if (this.collection.length > 0) {
				this.$el.hide();
			} else {
				this.$el.show();
			}
		},
		initialize: function() {
			this.listenTo(this.collection, 'reset add', this.toggle);
		}
	});

	var posts = new postlistr.model.Posts([], {
		url: 'http://public-api.wordpress.com/rest/v1/sites/'+ postlistr.initalurl +'/posts/?number=10&callback=?'
	});

	var postList = new postlistr.view.PostList({
		el: '#postlistr-app',
		collection: posts
	});

	var blogForm = new postlistr.view.BlogForm({
		el: postlistr.formclass,
		collection: posts
	});

	var spinner = new postlistr.view.LoadingSpinner({
		el: '#postlistr-spinner',
		collection: posts
	});

}(jQuery));