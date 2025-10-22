from flask import Flask, render_template_string, request
import os

app = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

HTML_PAGE = """
<!doctype html>
<title>CoatVision MVP</title>
<h1>Last opp et bilde</h1>
<form method=post enctype=multipart/form-data>
  <input type=file name=file>
  <input type=submit value=Last opp>
</form>
{% if filename %}
  <h2>Opplastet bilde:</h2>
  <img src="{{ url_for('uploaded_file', filename=filename) }}" width="400">
{% endif %}
"""

@app.route('/', methods=['GET', 'POST'])
def upload_file():
    filename = None
    if request.method == 'POST':
        file = request.files['file']
        if file.filename != '':
            filepath = os.path.join(UPLOAD_FOLDER, file.filename)
            file.save(filepath)
            filename = file.filename
    return render_template_string(HTML_PAGE, filename=filename)

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return open(os.path.join(UPLOAD_FOLDER, filename), 'rb').read()

if __name__ == '__main__':
    app.run(debug=True)

