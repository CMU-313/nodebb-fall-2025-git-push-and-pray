<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Checkbox + Radio Example</title>
  <!-- Bootstrap CSS -->
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="p-4">

  <div class="container">

    <!-- Your original checkbox + text -->
    <div class="input-group mb-3">
      <div class="input-group-text">
        <input class="form-check-input mt-0" type="checkbox" value="" aria-label="Checkbox for following text input">
      </div>
      <input type="text" class="form-control" aria-label="Text input with checkbox">
    </div>

    <!-- Your original radio + text -->
    <div class="input-group mb-3">
      <div class="input-group-text">
        <input class="form-check-input mt-0" type="radio" value="" aria-label="Radio button for following text input">
      </div>
      <input type="text" class="form-control" aria-label="Text input with radio button">
    </div>

    <!-- NEW: Anonymous toggle -->
    <div class="form-check form-switch mt-4">
      <input class="form-check-input" type="checkbox" id="anonymousSwitch">
      <label class="form-check-label" for="anonymousSwitch">
        Post Anonymously
      </label>
    </div>

  </div>

</body>
</html>
