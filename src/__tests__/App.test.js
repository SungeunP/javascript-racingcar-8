import App from "../App.js";
import { MissionUtils } from "@woowacourse/mission-utils";

const mockReadLineAsync = jest.fn();
const mockPrint = jest.fn();
const mockPickNumberInRange = jest.fn();

MissionUtils.Console.readLineAsync = mockReadLineAsync;
MissionUtils.Console.readLineAsync = mockReadLineAsync;
MissionUtils.Console.readLineAsync = mockReadLineAsync;

describe("자동차 경주 게임 테스트", () => {
  let app;

  beforeEach(() => {
    app = new App();
    mockReadLineAsync.mockClear();
    mockPrint.mockClear();
    mockPickNumberInRange.mockClear();
  });

  describe("경주에 참가하는 자동차 이름들의 유효성 검사", () => {
    test("이름이 5자를 초과할 시 예외를 발생시킨다.", () => {
      const longName = "pobi,woni,jun,seongeun";
      expect(() => app.validateCarNames(longName)).toThrow("[ERROR]");
    });

    test(",(comma)사이 이름이 비어있는 경우 예외를 발생시킨다.", () => {
      const emptyName = "pobi,,jun";
      expect(() => app.validateCarNames(emptyName)).toThrow("[ERROR]");
    });

    test("runStageReceiveCarNames - 유효한 이름을 입력하면 this.carNames에 저장된다.", async () => {
      const carNames = "pobi,woni,jun";
      mockReadLineAsync.mockResolvedValue(carNames);
      await app.runStageReceiveCarNames();
      expect(app.carNames).toEqual(["pobi", "woni", "jun"]);
    });

    test("runStageReceiveCarNames - 경주에 참가하는 유효한 자동차가 1개 미만이면 예외를 발생시킨다.", async () => {
      mockReadLineAsync.mockResolvedValue(""); // 빈 문자열 입력
      // 비동기 함수의 예외는 rejects.toThrow로 테스트합니다.
      await expect(app.runStageReceiveCarNames()).rejects.toThrow(
        "[ERROR] 경주할 자동차가 없습니다."
      );
    });
  });

  describe("라운드 횟수에 대한 유효성 검사", () => {
    test("숫자가 아닌 값을 입력하면 예외를 발생시킨다.", async () => {
      mockReadLineAsync.mockResolvedValue("abc");
      await expect(app.runStageReceiveIterateNumber()).rejects.toThrow(
        "[ERROR]"
      );
    });

    test("1 미만의 숫자를 입력하면 예외를 발생시킨다.", async () => {
      mockReadLineAsync.mockResolvedValue("0");
      await expect(app.runStageReceiveIterateNumber()).rejects.toThrow(
        "[ERROR]"
      );
    });

    test("정수가 아닌 숫자를 입력하면 예외를 발생시킨다.", async () => {
      mockReadLineAsync.mockResolvedValue("1.5");
      await expect(app.runStageReceiveIterateNumber()).rejects.toThrow(
        "[ERROR]"
      );
    });

    test("유효한 횟수를 입력하면 this.iterationCount에 저장된다.", async () => {
      mockReadLineAsync.mockResolvedValue("5");
      await app.runStageReceiveIterateNumber();
      expect(app.iterationCount).toBe(5);
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
    test("단독 우승자를 올바르게 출력한다. (pobi가 우승했다고 가정했을 시)", () => {
      const carNames = ["pobi", "woni", "jun"];
      const result = ["---", "-", "--"];
      app.runStagePrintWinner(result, carNames);

      expect(mockPrint).toHaveBeenLastCalledWith("최종 우승자 : pobi");
    });

    test("공동 우승자를 쉼표로 구분하여 올바르게 출력한다. (동률이 나와서 pobi, jun이 공동 우승이 될 시)", () => {
      const carNames = ["pobi", "woni", "jun"];
      const result = ["---", "-", "---"]; // pobi, jun 공동 우승
      app.runStagePrintWinner(result, carNames);

      expect(mockPrint).toHaveBeenLastCalledWith("최종 우승자 : pobi, jun");
    });
  });

  describe("레이싱 경기 실행", () => {
    test("게임이 정상적으로 실행되고 결과를 올바르게 출력한다.", async () => {
      // 1. 값 입력
      mockReadLineAsync
        .mockResolvedValueOnce("pobi,woni") // 자동차 이름
        .mockResolvedValueOnce("2"); // 시도 횟수

      // 2. 랜덤 값 실행 (총 2라운드로 가정, 4번 시행)
      mockPickNumberInRange
        .mockReturnValueOnce(5) // pobi 1칸 전진
        .mockReturnValueOnce(1) // woni 정지
        .mockReturnValueOnce(0) // pobi 정지
        .mockReturnValueOnce(4); // woni 1칸 전진

      // 3. 게임 실행
      await app.run();

      // 4. 출력 결과 검증
      const expectedPrints = [
        "\n실행 결과",
        "pobi : -", // 1라운드 pobi
        "woni : ", // 1라운드 woni
        "", // 1라운드 끝
        "pobi : -", // 2라운드 pobi
        "woni : -", // 2라운드 woni
        "", // 2라운드 끝
        "최종 우승자 : pobi, woni", // 최종 결과
      ];

      // mockPrint.mock.calls는 [ [arg1], [arg2], ... ] 형태의 2차원 배열입니다.
      const actualPrints = mockPrint.mock.calls.map((call) => call[0]);

      expect(actualPrints).toEqual(expectedPrints);
    });

    test("예외 발생 시 [ERROR] 메시지를 출력하고 다시 throw한다.", async () => {
      // 5자를 넘는 'seongeun' 자동차 이름 입력
      mockReadLineAsync.mockResolvedValue("seongeun,pobi");

      await expect(app.run()).rejects.toThrow("[ERROR]");

      // 에러 메시지 출력을 확인
      expect(mockPrint).toHaveBeenCalledWith(
        expect.stringContaining("[ERROR]")
      );
    });
  });
});
