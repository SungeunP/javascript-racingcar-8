import App from "../App.js"; // 경로 수정
import { MissionUtils } from "@woowacourse/mission-utils";

// Mocking MissionUtils
const mockReadLineAsync = jest.spyOn(MissionUtils.Console, "readLineAsync");
const mockPrint = jest.spyOn(MissionUtils.Console, "print");
const mockPickNumberInRange = jest.spyOn(
  MissionUtils.Random,
  "pickNumberInRange"
);

describe("자동차 경주 게임 테스트", () => {
  let app;

  beforeEach(() => {
    app = new App();
    jest.clearAllMocks();
  });

  describe("경주에 참가하는 자동차 이름들의 유효성 검사", () => {
    test("이름이 5자를 초과할 시 예외를 발생시킨다.", () => {
      const longName = "pobi,woni,jun,seongeun"; // "seongeun" 6자
      expect(() => app.validateCarNames(longName)).toThrow("[ERROR]");
    });

    test(",(comma)사이 이름이 비어있는 경우 예외를 발생시킨다.", () => {
      const emptyName = "pobi,,jun";
      expect(() => app.validateCarNames(emptyName)).toThrow("[ERROR]");
    });

    test("runStageReceiveCarNames - 유효한 이름을 입력하면 this.carNames에 저장된다.", async () => {
      mockReadLineAsync.mockResolvedValue("pobi,woni,jun");

      await app.runStageReceiveCarNames();

      expect(app.carNames).toEqual(["pobi", "woni", "jun"]);
    });

    test("runStageReceiveCarNames - 유효하지 않은 이름 입력 시 예외를 throw한다.", async () => {
      mockReadLineAsync.mockResolvedValue("pobi,seongeun"); // seongeun 6자

      await expect(app.runStageReceiveCarNames()).rejects.toThrow("[ERROR]");
    });
  });

  describe("라운드 횟수에 대한 유효성 검사", () => {
    test("runStageReceiveIterateNumber - 유효한 횟수를 입력하면 this.iterationCount에 저장된다.", async () => {
      mockReadLineAsync.mockResolvedValue("5");

      await app.runStageReceiveIterateNumber();

      expect(app.iterationCount).toBe(5);
    });

    test("runStageReceiveIterateNumber - 숫자가 아닌 값을 입력하면 예외를 발생시킨다.", async () => {
      mockReadLineAsync.mockResolvedValue("abc");
      await expect(app.runStageReceiveIterateNumber()).rejects.toThrow(
        "[ERROR]"
      );
    });

    test("runStageReceiveIterateNumber - 1 미만의 숫자를 입력하면 예외를 발생시킨다.", async () => {
      mockReadLineAsync.mockResolvedValue("0");
      await expect(app.runStageReceiveIterateNumber()).rejects.toThrow(
        "[ERROR]"
      );
    });

    test("runStageReceiveIterateNumber - 정수가 아닌 숫자를 입력하면 예외를 발생시킨다.", async () => {
      mockReadLineAsync.mockResolvedValue("1.5");
      await expect(app.runStageReceiveIterateNumber()).rejects.toThrow(
        "[ERROR]"
      );
    });
  });

  describe("레이싱 경기 라운드 진행에 대한 테스트", () => {
    test("랜덤 값이 4 이상이면 true를 반환한다.", () => {
      mockPickNumberInRange.mockReturnValue(4);
      expect(app.isMoveForward()).toBe(true);

      mockPickNumberInRange.mockReturnValue(9);
      expect(app.isMoveForward()).toBe(true);
    });

    test("랜덤 값이 3 이하이면 false를 반환한다.", () => {
      mockPickNumberInRange.mockReturnValue(3);
      expect(app.isMoveForward()).toBe(false);

      mockPickNumberInRange.mockReturnValue(0);
      expect(app.isMoveForward()).toBe(false);
    });
  });

  describe("우승자 판별 (runStagePrintWinner)", () => {
    test("단독 우승자를 올바르게 출력한다.", () => {
      const carNames = ["pobi", "woni", "jun"];
      const result = ["---", "-", "--"];
      app.runStagePrintWinner(result, carNames);

      expect(mockPrint).toHaveBeenLastCalledWith("최종 우승자 : pobi");
    });

    test("공동 우승자를 쉼표로 구분하여 올바르게 출력한다.", () => {
      const carNames = ["pobi", "woni", "jun"];
      const result = ["---", "-", "---"]; // pobi, jun 공동 우승일 경우
      app.runStagePrintWinner(result, carNames);

      expect(mockPrint).toHaveBeenLastCalledWith("최종 우승자 : pobi, jun");
    });
  });

  // 'app.run()' 전체를 테스트하는 로직은 'ApplicationTest.js'와 중복되므로
  // 'run' 내부의 예외 처리 로직만 테스트합니다.
  describe("최종 실행 (run)", () => {
    test("예외 발생 시 [ERROR] 메시지를 출력하고 다시 throw한다.", async () => {
      mockReadLineAsync.mockResolvedValue("pobi,seongeun"); // 6자 이름

      await expect(app.run()).rejects.toThrow("[ERROR]");

      expect(mockPrint).toHaveBeenCalledWith(
        expect.stringContaining("[ERROR]")
      );
    });
  });
});
