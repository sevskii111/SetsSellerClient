String.prototype.capitalize = function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
}


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
                `<tr class='item'><td>${mySets[mySetsKeys[i]].name}</td><td>${mySetsKeys[i]}</td><td class="sets">${mySets[mySetsKeys[i]].sets}</td><td class='TFrate'>${mySets[mySetsKeys[i]].TFrate}</td><td class='CSrate'>${mySets[mySetsKeys[i]].CSrate}</td><td>${(mySets[mySetsKeys[i]].sets / mySets[mySetsKeys[i]].TFrate).toFixed(2)}</td><td>${(mySets[mySetsKeys[i]].sets / mySets[mySetsKeys[i]].CSrate).toFixed(2)}</td><td><input type="number" class="cart" data-id="${mySetsKeys[i]}" placeholder="0" max="${mySets[mySetsKeys[i]].sets}" min="0"></td><td>${targetSets[mySetsKeys[i]] ? targetSets[mySetsKeys[i]].sets : 0}</td><td><input type="number" class="target" data-id="${mySetsKeys[i]}" placeholder="0" min="${targetSets[mySetsKeys[i]] ? targetSets[mySetsKeys[i]].sets : 0}" max="${mySets[mySetsKeys[i]].sets + (targetSets[mySetsKeys[i]] ? targetSets[mySetsKeys[i]].sets : 0)}"></td></tr>`
            ));
        }
    }

    $('.table').DataTable({
        "paging": false,
        "info": false,
        "stateSave": false,
        "searching": false,
        "autoWidth": false,
        "order": [
            [2, "desc"]
        ]
    });

    $(".cart, .target").on("input", function (e) {
        setCart($(this));
        calcPrice();
    });

    var ma = 0,
        am = 0;

    var maxTF = -1;
    var maxCS = -1;

    function setCart($el) {
        var $this = $el;
        if ($this.hasClass("cart")) {
            $(".target").attr("disabled", true);
            type = "cart";
        } else {
            $(".cart").attr("disabled", true);
            type = "target";
        }
        let val = $this.val();
        var max = $this.attr("max");
        var min = $this.attr("min");
        val = Math.min(max, val);
        val = Math.max(min, val);

        var TFrate = Number($el.parent().parent().children('.TFrate').text());
        var CSrate = Number($el.parent().parent().children('.CSrate').text());
        if ((maxTF != "-1" && TFrate > maxTF) || (maxCS != "-1" && CSrate > maxCS)) {
            $el.val(0);
        } else {
            console.log(val - $this.attr("min"));
            if ($this.val() == val && val - $this.attr("min") > 0) {
                ma++;
            }
            $this.val(val);
            $("#DownloadOrder").attr("disabled", false);
        }
    }

    $(".set").on("input", function () {
        ma = 0;
        am = 0;
        var $this = $(this);
        var targets;
        if ($this.attr("id") == "SetCart") {
            $(".target, #SetTarget, #TM").attr("disabled", true).val("");
            $("#TM").css("display", "none");
            $("#CM").css("display", "block");
            targets = $(".cart");
        } else {
            $(".cart, #SetCart").attr("disabled", true).val("");
            $("#CM").css("display", "none");
            $("#TM").css("display", "block");
            targets = $(".target");
        }

        targets.val($this.val());
        targets.each(function () {
            setCart($(this));
        });

        calcPrice();

        if ($this.attr("id") == "SetCart") {
            $("#MaxCart").text(ma);
        } else {
            $("#MaxTarget").text(ma);
        }
        $(".InCart").text(am);

        if (!$this.val() || $this.val() == 0) {
            $(".clear").click();
        }


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

    $('#MaxTF, #MaxCS').on('input', function () {
        maxTF = Number($("#MaxTF").val());
        maxCS = Number($("#MaxCS").val());

        $('#Set' + type.capitalize()).trigger('input');

        calcPrice();
    });

    function calcPrice() {
        var cart = $("." + type);
        var totalSets = 0;
        var totalTF = 0;
        var totalCS = 0;

        var maxTF = Number($("#MaxTF").val());
        var maxCS = Number($("#MaxCS").val());
        for (var i = 0; i < cart.length; i++) {
            var $el = $(cart[i]);
            var amount = $el.val() - $el.attr("min");
            if (amount > 0) {
                var TFrate = Number($el.parent().parent().children('.TFrate').text());
                var CSrate = Number($el.parent().parent().children('.CSrate').text());
                am++;
                totalSets += amount;
                totalCS += amount / CSrate;
                totalTF += amount / TFrate;
            }
        }

        $("#Sets").text(totalSets);
        $("#TfPrice").text((totalTF).toFixed(2));
        $("#CsPrice").text((totalCS).toFixed(2));

    }
}