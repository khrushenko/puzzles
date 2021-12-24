$(function () {
    const MINUTES_TIMER = 1;

    function createPositions() {
        let res = [];
        for (let i = 0; i < 16; i++) {
            res.push([`${(i % 4) * 33}% ${Math.trunc(i / 4) * 33}%`, i]);
        }
        return res;
    }

    const POSITIONS = createPositions();

    function shuffle(array) {
        return array.sort(() => Math.random() - 0.5);
    }

    function clear() {
        $(".block").each(function () {
            $(this).empty();
        });
    }

    function randomizePuzzles() {
        clear();
        let randomPositions = shuffle(POSITIONS);
        $("#start .block").each(function (index, element) {
            let $puzzle = $("<div/>").addClass("puzzle");
            $puzzle.css("background-position", `${randomPositions[index][0]}`);
            $puzzle.data("index", `${randomPositions[index][1]}`);
            $(this).append($puzzle);
        });
        $(".puzzle").draggable({
            revert: true,
            revertDuration: 0,
        });
    }

    // TIMER

    function validNumber(n) {
        return n < 10 ? "0" + n : n;
    }

    let timerId;
    let secs;

    function startTimer() {
        timerId = setInterval(function () {
            if (secs > 0) {
                secs--;
                $(".timer span").text(
                    `${validNumber(Math.floor(secs / 60))} : ${validNumber(secs % 60)}`
                );
            } else {
                stopTimer();
                lose();
                $("#checkButton").attr("disabled", true);
            }
        }, 1000);
    }

    function stopTimer() {
        clearInterval(timerId);
    }

    function win() {
        showModal("Woohoo, well done, you did it!");
    }

    function lose() {
        showModal("It's a pity, but you lost");
    }

    function resetTimer() {
        secs = MINUTES_TIMER * 60;
        $(".timer span").text(
            `${validNumber(Math.floor(secs / 60))} : ${validNumber(secs % 60)}`
        );
    }

    resetTimer();
    randomizePuzzles();

    // NAVIGATION

    $("#startButton").on("click", startGame);
    $(".puzzle").on("mousedown", startGame);
    $("#newButton").on("click", newGame);
    $("#checkButton").on("click", checkGame);

    function startGame() {
        startTimer();
        $("#startButton").attr("disabled", true);
        $("#checkButton").attr("disabled", false);
        $(".puzzle").off("mousedown", startGame);
    }

    function newGame() {
        stopTimer();
        resetTimer();
        randomizePuzzles();
        $("#startButton").attr("disabled", false);
        $("#checkButton").attr("disabled", true);
        $(".puzzle").on("mousedown", startGame);
    }

    function checkPuzzles() {
        let flag = true;
        $("#result > .block").each(function (index) {
            let $puzzle = $(this).find(".puzzle");
            if (!$puzzle || index != $puzzle.data("index")) {
                flag = false;
                return false;
            }
        });
        return flag;
    }

    function checkGame() {
        stopTimer();
        showModal(
            `You still have time, you sure? \n
      ${validNumber(Math.floor(secs / 60))} : ${validNumber(secs % 60)}`,
            "Check",
            function () {
                $("#checkButton").attr("disabled", true);
                if (checkPuzzles()) win();
                else lose();
            }
        );
    }

    // MODAL WINDOW

    function closeModal() {
        $(".modal .modal-nav").empty();
        $(".modal-container").hide();
        $("body").css("overflow-y", "visible");
    }

    function showModal(text, btnText, btnFunc) {
        $(".modal-container").show();
        $("body").css("overflow-y", "hidden");
        $(".modal-container").css("z-index", "3");
        $(".modal .modal-text").text(`${text}`);

        let $close = $(`<button>Close</button>`).addClass(
            "modal-btn modal-close-btn"
        );
        if (!btnText) {
            $close.on("click", closeModal);
        } else {
            $close.click(function () {
                closeModal();
                startTimer();
            });
            let $btn = $(`<button>${btnText}</button>`)
                .addClass("modal-btn")
                .click(function () {
                    closeModal();
                    btnFunc();
                });
            $(".modal .modal-nav").append($btn);
        }
        $(".modal .modal-nav").append($close);
    }

    $(".block").droppable({
        accept: ".puzzle",
        drop: function (event, ui) {
            if ($(this).children().length == 0) {
                $(this).append(ui.draggable);
            }
        },
    });
});
