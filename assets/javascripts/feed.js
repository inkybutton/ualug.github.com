// Generated by CoffeeScript 1.3.3
(function() {

  $(function() {
    var FeedItem, FeedItemView, FeedItems, feed, log;
    log = function(arg) {
      console.log(arg);
      return arg;
    };
    FeedItem = Backbone.Model.extend({
      defaults: {
        date: moment(),
        type: "normal"
      },
      preRender: function() {
        var action, target, user;
        user = this.get("user");
        action = this.get("action");
        target = this.get("target");
        this.set("text", "" + ("<a class='user' href='" + user.link + "'>" + user.name + "</a>") + (" " + action + " ") + ("<a class='target' href='" + target.link + "'>" + target.name + "</a>"));
        return this.get("text");
      }
    });
    FeedItemView = Backbone.View.extend({
      tagName: "li",
      template: _.template($("noscript.template.feed").html()),
      render: function() {
        $("section.feed ul").append(this.template({
          date: this.model.get("date"),
          text: this.model.get("text"),
          type: this.model.get("type")
        }));
        return this;
      }
    });
    FeedItems = Backbone.Collection.extend({
      model: FeedItem,
      fetch: function() {
        var that;
        that = this;
        $.get("https://ualug-github-feed.herokuapp.com/proxy/github.json", function(j) {
          var items;
          items = [];
          _(j).each(function(ev, k) {
            var item;
            item = {
              date: moment(ev.created_at),
              user: {
                name: ev.actor.login,
                link: ev.actor.url
              }
            };
            _.extend(item, (function() {
              switch (ev.type.replace("Event", "")) {
                case "Follow":
                  return {
                    action: "followed",
                    target: {
                      name: ev.payload.target.login,
                      link: ev.payload.target.url
                    },
                    type: "special"
                  };
                case "Fork":
                  return {
                    action: "forked",
                    target: {
                      name: ev.payload.forkee.name,
                      link: ev.payload.forkee.html_url
                    },
                    type: "create"
                  };
                case "Create":
                  return {
                    action: "created",
                    target: {
                      name: ev.repo.name,
                      link: "https://github.com/" + ev.repo.name
                    },
                    type: "create"
                  };
                case "Watch":
                  return {
                    action: "stared",
                    target: {
                      name: "" + ev.repo.name,
                      link: "https://github.com/" + ev.repo.name
                    },
                    type: "special"
                  };
                case "Push":
                  return {
                    action: "pushed to",
                    target: {
                      name: ev.repo.name,
                      link: "https://github.com/" + ev.repo.name
                    }
                  };
                case "Gist":
                  return {
                    action: "gisted",
                    target: {
                      name: "#" + ev.payload.gist.id,
                      link: ev.payload.gist.html_url
                    },
                    type: ev.payload.action
                  };
                case "Delete":
                  return {
                    action: "deleted",
                    target: {
                      name: ev.payload.ref,
                      link: "https://github.com/" + ev.repo.name
                    },
                    type: "delete"
                  };
                case "CommitComment":
                  return {
                    action: "commented on",
                    target: {
                      name: ev.repo.name,
                      link: ev.payload.comment.html_url
                    }
                  };
                case "Download":
                  return {
                    action: "uploaded",
                    target: {
                      name: ev.payload.download.name,
                      link: ev.payload.download.html_url
                    },
                    type: "create"
                  };
                case "Gollum":
                  return {
                    action: "wikied",
                    target: {
                      name: ev.repo.name,
                      link: "https://github.com/" + ev.repo.name + "/wiki"
                    }
                  };
                case "IssueComment":
                  return {
                    action: "commented on",
                    target: {
                      name: "" + ev.repo.name + "\#" + ev.payload.issue.number,
                      link: ev.payload.comment.html_url
                    }
                  };
                case "Issues":
                  return {
                    action: ev.payload.action,
                    target: {
                      name: "" + ev.repo.name + "\#" + ev.payload.issue.number,
                      link: ev.payload.issue.html_url
                    },
                    type: (function() {
                      switch (ev.payload.action) {
                        case "opened":
                          return "create";
                        case "reopened":
                          return "special";
                        case "closed":
                          return "delete";
                      }
                    })()
                  };
                case "Member":
                  return {
                    action: "added a collaborator",
                    target: {
                      name: ev.payload.member.login,
                      link: ev.payload.member.html_url
                    },
                    type: "create"
                  };
                case "Public":
                  return {
                    action: "open sourced",
                    target: {
                      name: ev.repo.name,
                      link: "https://github.com/" + ev.repo.name
                    },
                    type: "create"
                  };
                case "PullRequest":
                  return {
                    action: ev.payload.action,
                    target: {
                      name: "" + ev.repo.name + "\#" + ev.payload.number,
                      link: ev.payload.pull_request.html_url
                    },
                    type: (function() {
                      switch (ev.payload.action) {
                        case "opened":
                          return "create";
                        case "reopened":
                          return "special";
                        case "closed":
                          return "delete";
                      }
                    })()
                  };
                case "PullRequestReviewComment":
                  return {
                    action: "commented on",
                    target: {
                      name: ev.repo.name,
                      link: ev.payload.comment.html_url
                    }
                  };
              }
            })());
            return items[k] = new that.model(item);
          });
          return that.reset(items);
        });
        return this;
      }
    });
    feed = new FeedItems;
    feed.on("reset", function() {
      $("section.feed ul").removeClass("loading");
      return _(_(feed.models.reverse()).chain().uniq(true, function(item) {
        return item.preRender();
      }).first(15).value()).each(function(item) {
        return (new FeedItemView({
          model: item
        })).render();
      });
    });
    return feed.fetch();
  });

}).call(this);
