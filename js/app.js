$(document).ready(function() {
    var Contact = Backbone.Model.extend({
        urlRoot: "#",
        defaults: {
            firstName: "",
            lastName: "",
            phone: "",
            email: "",
        }
    });

    var ContactRouter = Backbone.Router.extend({
        routes: {
            "add": "addContact",
            "edit/:id": "editContact",
        },

        addContact: function() {
            editView.model = new Contact();
            editView.render();
        },
        editContact: function(id) {
            editView.model = contacts.get(id);
            editView.render();
        }
    });

    var ContactList = Backbone.Collection.extend({
        model: Contact,

        initialize: function() {
            // Create some dummy data.
            for (var i = 0; i < 5; i++) {
                this.add(new Contact({
                    id: (i + 1),
                    firstName: "Foo" + (i + 1),
                    lastName: "Bar" + (i + 1),
                    phone: "555-" + (i + 1) + "-123",
                    email: "foo" + (i + 1) + "@gmail.com"
                }));
            }
        }
    });

    var ContactView = Backbone.View.extend({
        tagName: "tr",
        template: _.template($("#contact-row").html()),

        initialize: function(options) {
            this.render();
            this.listView = options.listView;
        },

        render: function() {
            this.$el.empty();
            this.$el.html(this.template(this.model.toJSON()));
            return this;
        },

        events: {
            "click": "select"
        },

        select: function(e) {
            this.listView.selectRow(this.model, this.el);
        }
    });

    var ListView = Backbone.View.extend({
        el: $("#contacts"),

        events: {
            "click #edit": "editRow",
            "click #new": "newRow",
            "click #delete": "deleteRow",
        },

        initialize: function() {
            this.render();
            this.collection.bind("all", this.render, this);
        },

        render: function() {
            this.$el.find("tbody").empty();
            this.collection.forEach(function(contact) {
                this.$el.find("tbody").append(new ContactView({
                    model: contact,
                    listView: this
                }).el);
            }.bind(this));
        },

        clearSelection: function() {
            this.$el.find(".selected").removeClass("selected");
        },

        selectRow: function(selectedContact, rowElement) {
            if (rowElement !== undefined) {
                this.clearSelection();
                $(rowElement).addClass("selected");
                this.selectedContact = selectedContact;
            }
        },

        editRow: function(e) {
            document.location.hash = "edit/" + this.selectedContact.id;
        },

        newRow: function(e) {
            this.clearSelection();
            document.location.hash = "add";
        },

        deleteRow: function(e) {
            this.clearSelection();
            this.selectedContact.destroy();
        }
    });

    var EditView = Backbone.View.extend({
        el: $("#editor-wrapper"),
        template: _.template($("#contact-editor").html()),

        events: {
            "click #submit": "submit",
            "click #cancel": "reset",
        },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            this.$el.find("#firstName").focus();
            return this;
        },

        submit: function(e) {
            e.preventDefault();

            this.model.save({
                firstName: $("#firstName").val(),
                lastName: $("#lastName").val(),
                phone: $("#phone").val(),
                email: $("#email").val(),
            });
            if (!this.model.has("id")) {
                this.model.set("id", contacts.length + 1);
                contacts.add(this.model);
            }

            this.reset();
        },

        reset: function() {
            this.$el.empty();
            document.location.hash = "";
        }
    });


    var contacts = new ContactList();
    var editView = new EditView();
    var listView = new ListView({ collection: contacts });
    var appRouter = new ContactRouter();
    Backbone.history.start();
});
