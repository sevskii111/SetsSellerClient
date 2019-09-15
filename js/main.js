$(document).ready(function () {
    $("#InputFile").on("input", function (e) {

    });
});

function handleImport(files) {
    var file = files[0];
    var reader = new FileReader();
    reader.readAsText(file);
    $(reader).on('load', processFile);
}

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

function processFile(e) {
    var report = JSON.parse(e.target.result);
    var mySets = report.mySets,
        targetSets = report.targetSets,
        rates = report.rates,
        type;
    $("#Import").addClass("d-none");
    $("#TableContainer").removeClass("d-none");
    var mySetsKeys = Object.keys(mySets);
    for (var i = 0; i < mySetsKeys.length; i++) {
        if (mySets[mySetsKeys[i]].sets > 0) {
            $("#AppidsTable").append($(
                `<tr><td>${mySets[mySetsKeys[i]].name}</td><td>${mySetsKeys[i]}</td><td>${mySets[mySetsKeys[i]].sets}</td><td>${rates.TF2}</td><td>${rates.CSGO}</td><td>${(mySets[mySetsKeys[i]].sets / rates.TF2).toFixed(2)}</td><td>${(mySets[mySetsKeys[i]].sets / rates.CSGO).toFixed(2)}</td><td><input type="number" class="cart" data-id="${mySetsKeys[i]}" placeholder="0" max="${mySets[mySetsKeys[i]].sets}" min="0"></td><td>${targetSets[mySetsKeys[i]] ? targetSets[mySetsKeys[i]].sets : 0}</td><td><input type="number" class="target" data-id="${mySetsKeys[i]}" placeholder="0" min="${targetSets[mySetsKeys[i]] ? targetSets[mySetsKeys[i]].sets : 0}" max="${mySets[mySetsKeys[i]].sets + (targetSets[mySetsKeys[i]] ? targetSets[mySetsKeys[i]].sets : 0)}"></td></tr>`
            ));
        }
    }

    $(".cart, .target").on("input", function (e) {
        var $this = $(this);
        if ($this.hasClass("cart")) {
            $(".target").attr("disabled", true);
            type = "cart";
        } else {
            $(".cart").attr("disabled", true);
            type = "target";
        }
        let val = e.target.value;
        var max = $this.attr("max");
        var min = $this.attr("min");
        val = Math.min(max, val);
        val = Math.max(min, val);
        $this.val(val);
        $("#DownloadOrder").attr("disabled", false);

        calcPrice();
    });

    $(".set").on("input", function () {
        var $this = $(this);
        $(".cart, .target").attr("disabled", true).val("");
        var targets;
        if ($this.attr("id") == "SetCart") {
            $("#SetTarget").attr("disabled", true).val();
            targets = $(".cart");
        } else {
            $("#SetCart").attr("disabled", true).val();
            targets = $(".target");
        }

        targets.val($this.val());
        targets.trigger('input');
        if (!$this.val()) {
            $(".clear").click();
        }

        var totalSets = 0;

    });

    $(".clear").click(function () {
        $(".cart, .target, .set").attr("disabled", false).val("");
        $("#DownloadOrder").attr("disabled", true);
    });



    $("#DownloadOrder").click(function () {
        var result = {
            type: type,
            order: {}
        };
        var cart = $("." + type);
        for (var i = 0; i < cart.length; i++) {
            var $el = $(cart[i]);
            var val = $el.val();
            if (val > 0) {
                result.order[$el.data("id")] = val;
            }
        }
        download("order.json", JSON.stringify(result));
    });

    function calcPrice() {
        var cart = $("." + type);
        var totalSets = 0;
        for (var i = 0; i < cart.length; i++) {
            var $el = $(cart[i]);
            totalSets += $el.val() - $el.attr("min");
        }

        $("#Sets").text(totalSets);
        $("#TfPrice").text((totalSets / rates.TF2).toFixed(2));
        $("#CsPrice").text((totalSets / rates.CSGO).toFixed(2));

    }
}