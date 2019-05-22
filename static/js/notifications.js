/*eslint-env jquery*/
/*eslint semi: ["error", "always"]*/

$(document).ready(function() {
  renderSiteNotification();

  $(".notifications").on("click", ".close-notification", function(e) {
    e.preventDefault();
    const $notification = $(this).closest(".notification");
    localStorage.setItem(
      "dismissedNotification",
      $notification.data("notification-id")
    );
    $notification.remove();
  });
});

function renderSiteNotification() {
  const notificationId = $(".notification")
    .data("notification-id")
    .toString();
  if (localStorage.getItem("dismissedNotification") !== notificationId) {
    $(".notifications").removeClass("d-none");
  }
}