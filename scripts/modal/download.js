function downloadModal() {
    /* Private Variables */
    const WAV = wavConverter();
    const SFD = singleFileDownloader(WAV);
    const MFD = multiFileDownloader(WAV, SFD);

    /* Private Functions */
    // Handle download button click
    function handleDownload() {
        const isDownloadAll = $isDownloadAll.is(':checked');
        const isIgnoreADSR = $isIgnoreADSR.is(':checked');
        const downloadFrequency = Math.max(Math.min(parseFloat($downloadFrequency.val()), 20000), 0) || 440;
        const downloadDuration = Math.max(Math.min(parseFloat($downloadDuration.val()), 60), 0) || 3;

        if (isDownloadAll) {
            MFD.download(isIgnoreADSR, downloadDuration);
        } else {
            SFD.download(downloadFrequency, isIgnoreADSR, downloadDuration);
        }
    }

    /* Public Functions */

    function wireEvents() {
        $downloadBtn.on('click', function() {
            handleDownload();
        });

        $isDownloadAll.on('change', function() {
            $downloadFrequency.prop('disabled', $(this).is(':checked'));
        });
    }

    return {wireEvents};
}
