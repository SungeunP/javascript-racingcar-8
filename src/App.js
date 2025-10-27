import { Console, MissionUtils } from "@woowacourse/mission-utils";
class App {
  static ERROR_TITLE = "[ERROR]";
  static restriction_carLength = 5;

  /**
   * State variables
   */
  carNames;
  iterationCount;

  constructor() {
    this.carNames = [];
    this.iterationCount = 0;
  }

  // 사용자가 입력한 law car names string을 restriction을 적용하고 validate 하여 배열로 반환합니다.
  validateCarNames(carNames) {
    if (!carNames || typeof carNames !== "string") return [];

    const splitedResult = carNames.split(",");

    splitedResult.forEach((item) => {
      const trimmedItem = item.trim();
      if (trimmedItem.length < 1) {
        throw new Error(
          `${App.ERROR_TITLE} 경주할 자동차의 이름이 비어있습니다.`
        );
      }
      if (trimmedItem.length > App.restriction_carLength) {
        throw new Error(
          `${App.ERROR_TITLE} 경주할 자동차의 이름이 5자가 넘습니다. (${item})`
        );
      }
    });

    return splitedResult
      .map((name) => name.trim())
      .filter((name) => name.length > 0);
  }

  // 레이싱 게임의 규칙에 따라 렌덤 값이 4 이상인 경우 true를 반환하여 move forward를 허용한다.
  isMoveForward() {
    const randomValue = MissionUtils.Random.pickNumberInRange(0, 9);
    if (randomValue >= 4) {
      return true;
    }
    return false;
  }

  /**
   * Stage 1: 레이싱에 참가할 자동차 명을 입력 받습니다.
   */
  async runStageReceiveCarNames() {
    const unsafeCarNames = await Console.readLineAsync(
      "경주할 자동차 이름을 입력하세요.(이름은 쉼표(,) 기준으로 구분)\n"
    );
    this.carNames = this.validateCarNames(unsafeCarNames);
    // Validate for `safeCarNames`
    if (this.carNames.length < 1) {
      throw new Error(`${App.ERROR_TITLE} 경주할 자동차가 없습니다.`);
    }
  }

  /**
   * Stage 2: 레이싱의 라운드 반복 횟수를 입력 받습니다.
   */
  async runStageReceiveIterateNumber() {
    const unsafeIterationCount = await Console.readLineAsync(
      "시도할 횟수는 몇 회인가요?\n"
    );
    // validate string `unsafeIterationCount`
    const count = Number(unsafeIterationCount);
    if (isNaN(count)) {
      throw new Error(
        `${App.ERROR_TITLE} 입력한 시도할 횟수가 숫자가 아닙니다. (${unsafeIterationCount})`
      );
    }

    if (count < 1 || !Number.isInteger(count)) {
      // validate number `unsafeIterationCount`
      throw new Error(
        `${App.ERROR_TITLE} 시도할 횟수는 1 이상의 정수여야 합니다.`
      );
    }

    this.iterationCount = count;
  }

  /**
   * Stage 3-1: 라운드에 참여한 자동차에 대해 순회하여 전진합니다.
   */
  iterateCars(carNames, carMovedArray) {
    const newCarMovedArray = [...carMovedArray];
    for (let j = 0; j < carNames.length; j++) {
      if (this.isMoveForward()) {
        newCarMovedArray[j] += "-";
      }
      Console.print(`${carNames[j]} : ${newCarMovedArray[j]}`);
    }
    return newCarMovedArray;
  }
  /**
   * Stage 3: 게임을 플레이합니다.
   */
  runStageStartRace(iteration, carNames) {
    let carMovedArray = Array.from({ length: carNames.length }, () => "");
    Console.print("\n실행 결과");
    for (let i = 0; i < iteration; i++) {
      carMovedArray = this.iterateCars(carNames, carMovedArray);
      Console.print("");
    }
    return carMovedArray;
  }

  /**
   * Stage 4: 우승자를 출력합니다.
   */
  runStagePrintWinner(result, carNames) {
    const moveLengths = result.map((item) => item.length);
    const maxMoveLength = Math.max(...moveLengths);

    const winners = carNames.filter(
      (carName, i) => result[i].length === maxMoveLength
    );

    Console.print(`최종 우승자 : ${winners.join(", ")}`);
  }

  async run() {
    try {
      await this.runStageReceiveCarNames();
      await this.runStageReceiveIterateNumber();

      const result = this.runStageStartRace(this.iterationCount, this.carNames);

      this.runStagePrintWinner(result, this.carNames);
    } catch (error) {
      Console.print(error.message);
      throw error;
    }
  }
}

export default App;
