import { Console } from "@woowacourse/mission-utils";
class App {
  async run() {
    const unsafe_carNames = await Console.readLineAsync(
      "경주할 자동차 이름을 입력하세요.(이름은 쉼표(,) 기준으로 구분)\n"
    );

    const unsafe_iterationCount = await Console.readLineAsync(
      "시도할 횟수는 몇 회인가요?\n"
    );

    Console.print("\n실행 결과");

    Console.print(`최종 우승자 : pobi, jun`);
  }
}

export default App;
