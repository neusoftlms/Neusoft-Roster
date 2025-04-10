// Add to the $(document).ready() function:

// Update sync status indicator
function updateSyncStatus() {
    const lastSync = localStorage.getItem('lastSync');
    const statusElement = $('#syncStatus');
    
    if (lastSync) {
        statusElement.html(`Synced: ${new Date(lastSync).toLocaleString()}`);
        statusElement.addClass('text-success').removeClass('text-warning');
    } else {
        statusElement.text('Local Storage (Not Synced)');
        statusElement.addClass('text-warning').removeClass('text-success');
    }
}

// Help modal
$('#helpBtn').click(function() {
    const helpModal = `
        <div class="modal fade" id="helpModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title"><i class="bi bi-question-circle"></i> Help Guide</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <div class="accordion" id="helpAccordion">
                            <div class="accordion-item">
                                <h2 class="accordion-header" id="headingOne">
                                    <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne">
                                        Adding New Employees
                                    </button>
                                </h2>
                                <div id="collapseOne" class="accordion-collapse collapse show" aria-labelledby="headingOne">
                                    <div class="accordion-body">
                                        <p>To add a new employee:</p>
                                        <ol>
                                            <li>Click the "Add New Employee" button</li>
                                            <li>Fill in all required fields (marked with *)</li>
                                            <li>Navigate through the tabs to complete all sections</li>
                                            <li>Click "Save Employee" to store the record</li>
                                        </ol>
                                    </div>
                                </div>
                            </div>
                            <div class="accordion-item">
                                <h2 class="accordion-header" id="headingTwo">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo">
                                        Recording Attrition
                                    </button>
                                </h2>
                                <div id="collapseTwo" class="accordion-collapse collapse" aria-labelledby="headingTwo">
                                    <div class="accordion-body">
                                        <p>To record employee attrition:</p>
                                        <ol>
                                            <li>Navigate to the Attrition tab</li>
                                            <li>Click "Record Attrition"</li>
                                            <li>Select the employee from the dropdown</li>
                                            <li>Enter the last working date and reason</li>
                                            <li>Add any additional details or notes</li>
                                            <li>Click "Record Attrition" to save</li>
                                        </ol>
                                    </div>
                                </div>
                            </div>
                            <div class="accordion-item">
                                <h2 class="accordion-header" id="headingThree">
                                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseThree">
                                        GitHub Sync
                                    </button>
                                </h2>
                                <div id="collapseThree" class="accordion-collapse collapse" aria-labelledby="headingThree">
                                    <div class="accordion-body">
                                        <p>To sync with GitHub:</p>
                                        <ol>
                                            <li>Create a personal access token with repo permissions</li>
                                            <li>Enter your repository details in the GitHub Sync tab</li>
                                            <li>Click "Save Configuration"</li>
                                            <li>Use "Load from GitHub" to import data</li>
                                            <li>Use "Save to GitHub" to backup your data</li>
                                        </ol>
                                        <p class="text-muted mt-3">
                                            <i class="bi bi-info-circle"></i> Data is stored in JSON files in your repository.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    $('body').append(helpModal);
    const modal = new bootstrap.Modal(document.getElementById('helpModal'));
    modal.show();
    
    // Remove modal from DOM after it's closed
    $('#helpModal').on('hidden.bs.modal', function () {
        $(this).remove();
    });
});

// Add hover effects to table rows
$('#employeesTable, #attritionTable').on('mouseenter', 'tbody tr', function() {
    $(this).css('transform', 'translateX(5px)');
    $(this).css('box-shadow', '0 2px 8px rgba(0,0,0,0.1)');
}).on('mouseleave', 'tbody tr', function() {
    $(this).css('transform', '');
    $(this).css('box-shadow', '');
});

// Initialize tooltips
$(function () {
    $('[data-bs-toggle="tooltip"]').tooltip();
});

// Call this at the end of your document.ready function
updateSyncStatus();
