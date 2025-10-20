function helpAndWelcomeModal() {
    function wireEvents() {
        // Handle navigation between help sections
        $helpNavItems.on('click', function(e) {
            // Activate clicked nav item 
            e.preventDefault();
            $helpNavItems.removeClass('active');
            $(this).addClass('active');

            // Show corresponding help section
            const targetSection = $(this).data('section');
            $helpSections.addClass('d-none');
            $(`#${targetSection}-section`).removeClass('d-none');
        });

        // Handle welcome modal "Do not show again" checkbox
        $btnCloseWelcomeModal.on('click', function () {
            if ($noShowCheckbox.prop('checked')) {
                localStorage.setItem('hideWelcomeModal', 'true');
            }
        });
    }

    return {wireEvents};
}


