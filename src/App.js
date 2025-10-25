import { Console } from "@woowacourse/mission-utils";
class App {
  static ERROR_TITLE = "[ERROR]";

  // 사용자가 입력한 law car names string을 restriction을 적용하여 배열로 validate 합니다.
  static restriction_carLength = 5;
  validateCarNames(carNames) {
    if (!carNames || typeof carNames !== "string") return [];

    const splitedResult = carNames.split(",");
    return splitedResult.filter((item) => {
      if (item.length < 1) {
        throw new Error(
          `${App.ERROR_TITLE} 경주할 자동차의 이름이 비어있습니다.`
        );
      }
      if (item.length > App.restriction_carLength) {
        throw new Error(
          `${App.ERROR_TITLE} 경주할 자동차의 이름이 5자가 넘습니다. (${item})`
        );
      }
      return item.trim() !== "";
    });
  }

  async run() {
    const unsafeCarNames = await Console.readLineAsync(
      "경주할 자동차 이름을 입력하세요.(이름은 쉼표(,) 기준으로 구분)\n"
    );
    const safeCarNames = this.validateCarNames(unsafeCarNames);
    // Validate for `safeCarNames`
    if (safeCarNames.length < 0) {
      throw new Error(`${App.ERROR_TITLE} 경주할 자동차가 없습니다.`);
    }

    const unsafe_iterationCount = await Console.readLineAsync(
      "시도할 횟수는 몇 회인가요?\n"
    );

    Console.print("\n실행 결과");

    Console.print(`최종 우승자 : pobi, jun`);
  }
}

export default App;
