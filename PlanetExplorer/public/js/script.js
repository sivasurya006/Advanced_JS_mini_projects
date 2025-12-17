$('#overview,#internal,#geology').on('click',(e) => {
    const data = e.currentTarget.dataset;
    $('#planetNavigation > div').css('backgroundColor','');
    e.currentTarget.style.backgroundColor = e.currentTarget.parentElement.dataset.navcolor;
    $('#planetImage').attr('src',data.url);
    $('#aboutPlanet').text(data.content);
})