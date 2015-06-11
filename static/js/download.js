upload.modules.addmodule({
    name: 'download',
    // Dear santa, https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/template_strings
    template: '\
        <div id="downloaddetails"></div>\
        <h1 id="downloaded_filename"></h1>\
        <div id="globalbtnarea">\
            <a class="btn" id="newupload" href="#">New Upload</a>\
        </div>\
        <div id="btnarea">\
                <a class="btn" id="dlbtn" href="#">Download</a>\
                <a class="btn" id="inbrowserbtn" target="_blank" href="#">View In Browser</a>\
                <a class="btn" id="deletebtn" href="#">Delete</a>\
            </div>\
    ',
    init: function () {
    },
    route: function (route, content) {
        return this
    },
    render: function (view) {
        view.html(this.template)
        this._ = {}

        this._.detailsarea = view.find('#downloaddetails')
        this._.filename = view.find('#downloaded_filename')
        this._.btns = view.find('#btnarea')
        this._.deletebtn = view.find('#deletebtn')
        this._.dlbtn = view.find('#dlbtn')
        this._.viewbtn = view.find('#inbrowserbtn')
        this._.globalbtns = view.find('#globalbtnarea')
        $('#footer').hide()
    },
    initroute: function (content) {
        this._.filename.hide()
        this._.btns.hide()
        this._.globalbtns.hide()
        this._.content = {}
        this._.content.main = this._.content.loading = $('<h1>').prop('id', 'downloadprogress').text('Downloading')
        this._.detailsarea.empty().append(this._.content.main)
        this._.deletebtn.hide()
        upload.updown.download(content, this.progress.bind(this), this.downloaded.bind(this))
    },
    unrender: function () {
        delete this['_']
    },
    downloaded: function (data) {
        this._.filename.text(data.header.name)

        var stored = localStorage.getItem('delete-' + data.ident)

        if (stored) {
            this._.deletebtn.show().prop('href', (upload.config.server ? upload.config.server : '') + 'del?delkey=' + stored + '&ident=' + data.ident)
        }

        var url = URL.createObjectURL(data.decrypted)

        this._.viewbtn.prop('href', url)
        this._.dlbtn.prop('href', url)
        this._.dlbtn.prop('download', data.header.name)

        delete this._['content']
        this._.detailsarea.empty()

        if (data.header.mime.startsWith('image/')) {

            var imgcontent = $('<div>').prop('id', 'previewimg').addClass('preview').appendTo(this._.detailsarea)

            var previewimg = $('<img>').addClass('dragresize').appendTo(imgcontent).prop('src', url)

        } else if (data.header.mime.startsWith('text/')) {
            var textcontent = $('<div>').prop('id', 'downloaded_text').addClass('preview').addClass('previewtext').appendTo(this._.detailsarea)

            var linenos = $('<div>').prop('id', 'linenos').appendTo(textcontent)

            var pre = $('<pre>').appendTo(textcontent)

            var code = $('<code>').appendTo(pre)

            var fr = new FileReader()

            fr.onload = function () {

                var text = fr.result

                code.text(text)

                hljs.highlightBlock(code[0])

                var length = text.split(/\r\n|\r|\n/).length

                for (var i = 0; i < length; i++) {
                    linenos.append((i + 1) + '<br>')
                }

            }
            fr.readAsText(data.decrypted)
        } else if (data.header.mime.startsWith('video/')) {
            $('<video>').addClass('preview').prop('controls', true).prop('autoplay', true).appendTo(this._.detailsarea).prop('src', url)
        } else if (data.header.mime.startsWith('audio/')) {
            $('<audio>').addClass('preview').prop('controls', true).prop('autoplay', true).appendTo(this._.detailsarea).prop('src', url)
        } else {
            // Unknown, todo
        }
        this._.filename.show()
        this._.btns.show()
        this._.globalbtns.show()
    },
    progress: function (e) {
        if (e == 'decrypting') {
            this._.content.loading.text('Decrypting')
        } else if (e == 'error') {
          this._.content.loading.text('File not found or corrupt')
          this._.globalbtns.show()
        } else {
            var percent = (e.loaded / e.total) * 100
            this._.content.loading.text(Math.floor(percent) + '%')
        }
    }
})
